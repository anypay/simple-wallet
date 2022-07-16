require('dotenv').config()

import { getRPC } from './rpc'

import config from './config'

import BigNumber from 'bignumber.js'

import { getBitcore, toSatoshis } from './bitcore'

import { Invoice, Payment } from './invoice'

import { Client } from './client'

import { anypay } from './anypay'

import axios from 'axios'

var assets = require('require-all')({
  dirname  :  __dirname + '/assets',
  recursive: true,
  filter      :  /(.+)\.ts$/,
  map: (name) => name.toUpperCase()
});

const XMR = require('./assets/xmr')

import { getRecommendedFees } from './mempool.space'

interface PaymentTx {
  tx_hex: string;
  tx_hash?: string;
  tx_key?: string;
}

export interface Balance {
  asset: string;
  address: string;
  value: number;
  value_usd?: number;
}

interface LoadCard {
  asset: string;
  privatekey: string;
}

export class Wallet {
  cards: Card[]

  constructor(params: {
    cards: Card[]
  }) {
    this.cards = params.cards
  }

  static async load(cards: LoadCard[]): Promise<Wallet> {

    return new Wallet({ cards: cards.map(card => new Card(card)) })

  }

  async balances() {

    let balances = await Promise.all(this.cards.map(async card => {
 
      try {

        let balance = await card.balance()

        return balance

      } catch(error) {

        return null

      }

    }))

    return balances.filter(balance => balance !== null)

  }


  async payInvoice(invoice_uid: string, asset:string, {transmit}:{transmit: boolean}={transmit:true}): Promise<PaymentTx> {

    return this.payUri(`${config.get('API_BASE')}/i/${invoice_uid}`, asset, { transmit })
  }

  async payUri(uri: string, asset:string, {transmit}:{transmit: boolean}={transmit:true}): Promise<PaymentTx> {

    let client = new Client(uri)

    let paymentRequest = await client.selectPaymentOption({
      chain: asset,
      currency: asset
    })

    var payment;

    var options: any;

    if (asset === 'XMR') {

      options = await XMR.buildPayment(paymentRequest)

      console.log('__options', { options, transmit })

      payment = options.tx_blob

    } else {

      payment = await this.buildPayment(paymentRequest, asset)

    }

    if (!transmit) return payment;

    let response = await client.transmitPayment(paymentRequest, payment, options)

    return payment

  }

  asset(asset: string) {
    return this.cards.filter(card => card.asset === asset)[0]
  }

  async newInvoice(newInvoice: { amount: number, currency: string }): Promise<Invoice> {
    return new Invoice()
  }


  async buildPayment(paymentRequest, asset) {

    let { instructions } = paymentRequest

    let wallet = this.asset(asset)

    let balance = await wallet.balance()

    let bitcore = getBitcore(asset)

    let privatekey = new bitcore.PrivateKey(wallet.privatekey)

    var tx, totalInput, totalOutput = 0;

    if (asset === 'LTC') {

      let inputs = wallet.unspent.map(output => {

        let satoshis = new BigNumber(output.amount).times(100000000).toNumber()

        return {
          txId: output.txid,
          outputIndex: output.vout,
          address: output.address,
          script: output.redeemScript,
          scriptPubKey: output.scriptPubKey,
          satoshis
        }
      })


      tx = new bitcore.Transaction()
        .from(inputs)
        .change(wallet.address)

    } else {


      tx = new bitcore.Transaction()
        .from(wallet.unspent)
        .change(wallet.address)

    }

    totalInput = wallet.unspent.reduce((sum, input) => {

      let satoshis = new BigNumber(input.amount).times(100000000).toNumber()

      return sum.plus(satoshis)

    }, new BigNumber(0)).toNumber()

    console.log({ totalInput })

    for (let output of instructions[0].outputs) {

      let address = bitcore.Address.fromString(output.address)

      let script = bitcore.Script.fromAddress(address)

      tx.addOutput(
        bitcore.Transaction.Output({
          satoshis: output.amount,
          script: script.toHex()
        })
      )

      totalOutput += output.amount

    }

    if (asset === 'BTC') {

      let { fastestFee } = await getRecommendedFees()

      const fee = fastestFee * tx._estimateSize()

      console.log({ fastestFee, fee })

      totalOutput  += fee;

      tx.fee(fee)

      let change = totalInput - totalOutput

      console.log({ change })
      
    }

    console.log({ totalOutput })

    tx.sign(privatekey)

    return tx.toString('hex')

  }

  async receive(amount: {currency: string, value: number}, assets?: string[]): Promise<Invoice> {

    let cards = this.cards

    if (assets) {

      cards = cards.filter(card => {

        let asset = assets.filter(asset => asset === card.asset)[0]

        return !!asset

      })

    }

    let template = cards.map(card => {

      return {
        currency: card.asset,
        to: [{
          address: card.address,
          currency: amount.currency,
          amount: amount.value
        }]
      }

    })

    return anypay.request(template)

  }

  async pay(uri: string, asset: string): Promise<Payment> {
    return new Payment()
  }

  async getInvoice(uid: string): Promise<any> {

    let { data } = await axios.get(`${config.get('API_BASE')}/invoices/${uid}`)

    return data

  }
}

export class Card {

  asset: string;
  privatekey: string;
  address: string;
  unspent: any[];

  constructor(params: {
    asset: string,
    privatekey: string
  }) {
    this.unspent = []
    this.asset = params.asset
    this.privatekey = params.privatekey

    let bitcore = getBitcore(this.asset)
    this.address = new bitcore.PrivateKey(this.privatekey).toAddress().toString();
  }
  
  async listUnspent() {
  }

  async balance(): Promise<Balance> {

    let rpc = getRPC(this.asset)

    if (rpc['getBalance']) {

      return rpc['getBalance'](this.address)

    }

    this.unspent = await rpc.listUnspent(this.address)

    let value = this.unspent.reduce((sum, output) => {

      return sum.plus(output.amount)

    }, new BigNumber(0)).toNumber()

    return {
      asset: this.asset,
      value,
      address: this.address
    }

  }

}

export async function loadWallet(loadCards: LoadCard[] = []) {

  let cards: Card[] = []

  for (let loadCard of loadCards) {

    cards.push(new Card(loadCard))

  }

  if (process.env.LTC_PRIVATE_KEY) {
    cards.push(new Card({
      asset: 'LTC',
      privatekey: process.env.LTC_PRIVATE_KEY
    }))
  }

  if (process.env.DOGE_PRIVATE_KEY) {
    cards.push(new Card({
      asset: 'DOGE',
      privatekey: process.env.DOGE_PRIVATE_KEY
    }))
  }

  if (process.env.DASH_PRIVATE_KEY) {
    cards.push(new Card({
      asset: 'DASH',
      privatekey: process.env.DASH_PRIVATE_KEY
    }))
  }

  if (process.env.BCH_PRIVATE_KEY) {
    cards.push(new Card({
      asset: 'BCH',
      privatekey: process.env.BCH_PRIVATE_KEY
    }))
  }

  if (process.env.BTC_PRIVATE_KEY) {
    cards.push(new Card({
      asset: 'BTC',
      privatekey: process.env.BTC_PRIVATE_KEY
    }))
  }

  if (process.env.BSV_PRIVATE_KEY) {
    cards.push(new Card({
      asset: 'BSV',
      privatekey: process.env.BSV_PRIVATE_KEY
    }))
  }

  if (process.env.XMR_SIMPLE_WALLET_SEED) {
    cards.push(new Card({
      asset: 'XMR',
      privatekey: process.env.XMR_SIMPLE_WALLET_SEED
    }))
  }

  if (process.env.XRP_PRIVATE_KEY) {
    cards.push(new Card({
      asset: 'XRP',
      privatekey: process.env.XRP_PRIVATE_KEY
    }))
  }

  return new Wallet({ cards })

}

