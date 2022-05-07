require('dotenv').config()

import { getRPC } from './rpc'

import BigNumber from 'bignumber.js'

import { getBitcore, toSatoshis } from './bitcore'

import { Invoice, Payment } from './invoice'

import { Client } from './client'

import { anypay } from './anypay'

import axios from 'axios'

export interface Balance {
  asset: string;
  amount: number;
}

export class Wallet {
  holdings: Holding[]

  constructor(params: {
    holdings: Holding[]
  }) {
    this.holdings = params.holdings
  }

  async balances() {

    let balances = await Promise.all(this.holdings.map(async holding => {
 
      try {

        let balance = await holding.balance()

        return balance

      } catch(error) {

        return null

      }

    }))

    return balances.filter(balance => balance !== null)

  }

  async payInvoice(invoice_uid: string, asset:string): Promise<any> {

    let client = new Client(`https://api.anypayx.com/i/${invoice_uid}`)

    let options = await client.getPaymentOptions()

    let paymentRequest = await client.selectPaymentOption({
      chain: asset,
      currency: asset
    })

    let { instructions } = paymentRequest

    let wallet = this.asset(asset)

    let balance = await wallet.balance()

    console.log('BALANCE', balance)

    let bitcore = getBitcore(asset)

    let privatekey = new bitcore.PrivateKey(wallet.privatekey)

    var tx;

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

    console.log('__UNSPENT__', wallet.unspent)
    console.log('ADDRESS', wallet.address)

    for (let output of instructions[0].outputs) {

      let address = bitcore.Address.fromString(output.address)

      let script = bitcore.Script.fromAddress(address)

      tx.addOutput(
        bitcore.Transaction.Output({
          satoshis: output.amount,
          script: script.toHex()
        })
      )

    }

    tx.sign(privatekey)

    let response = await client.transmitPayment(paymentRequest, tx.toString('hex'))

    return response

  }

  asset(asset: string) {
    return this.holdings.filter(holding => holding.asset === asset)[0]
  }

  async newInvoice(newInvoice: { amount: number, currency: string }): Promise<Invoice> {
    return new Invoice()
  }


  buildPayment(outputs: any[]) {

  }

  async receive(amount: {currency: string, value: number}, assets?: string[]): Promise<Invoice> {

    let holdings = this.holdings

    if (assets) {

      holdings = holdings.filter(holding => {

        let asset = assets.filter(asset => asset === holding.asset)[0]

        return !!asset

      })

    }

    let template = holdings.map(holding => {

      return {
        currency: holding.asset,
        to: [{
          address: holding.address,
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

    let { data } = await axios.get(`https://api.anypayx.com/invoices/${uid}`)

    return data

  }
}

export class Holding {

  asset: string;
  privatekey: string;
  address: string;
  unspent: any[];

  constructor(params: {
    asset: string,
    privatekey: string,
    address?: string,
  }) {
    this.asset = params.asset
    this.privatekey = params.privatekey
    this.address = params.address
    this.unspent = []
  }

  async balance(): Promise<Balance> {

    let rpc = getRPC(this.asset)

    if (rpc['getBalance']) {

      return rpc['getBalance'](this.address)

    }

    this.unspent = await rpc.listUnspent(this.address)

    let amount = this.unspent.reduce((sum, output) => {

      return sum.plus(output.amount)

    }, new BigNumber(0)).toNumber()

    return {
      asset: this.asset,
      amount
    }

  }
}

export async function loadWallet() {

  let holdings: Holding[] = []

  if (process.env.LTC_SIMPLE_WALLET_WIF) {
    holdings.push(new Holding({
      asset: 'LTC',
      privatekey: process.env.LTC_SIMPLE_WALLET_WIF,
      address: process.env.LTC_SIMPLE_WALLET_ADDRESS
    }))
  }

  if (process.env.DOGE_SIMPLE_WALLET_WIF) {
    holdings.push(new Holding({
      asset: 'DOGE',
      privatekey: process.env.DOGE_SIMPLE_WALLET_WIF,
      address: process.env.DOGE_SIMPLE_WALLET_ADDRESS,
    }))
  }

  if (process.env.DASH_SIMPLE_WALLET_WIF) {
    holdings.push(new Holding({
      asset: 'DASH',
      privatekey: process.env.DASH_SIMPLE_WALLET_WIF,
      address: process.env.DASH_SIMPLE_WALLET_ADDRESS
    }))
  }

  if (process.env.BCH_SIMPLE_WALLET_WIF) {
    holdings.push(new Holding({
      asset: 'BCH',
      privatekey: process.env.BCH_SIMPLE_WALLET_WIF,
      address: process.env.BCH_SIMPLE_WALLET_ADDRESS
    }))
  }

  if (process.env.BTC_SIMPLE_WALLET_WIF) {
    holdings.push(new Holding({
      asset: 'BTC',
      privatekey: process.env.BTC_SIMPLE_WALLET_WIF,
      address: process.env.BTC_SIMPLE_WALLET_ADDRESS
    }))
  }

  if (process.env.BSV_SIMPLE_WALLET_WIF) {
    holdings.push(new Holding({
      asset: 'BSV',
      privatekey: process.env.BSV_SIMPLE_WALLET_WIF,
      address: process.env.BSV_SIMPLE_WALLET_ADDRESS
    }))
  }

  if (process.env.XMR_SIMPLE_WALLET_SEED) {
    holdings.push(new Holding({
      asset: 'XMR',
      privatekey: process.env.XMR_SIMPLE_WALLET_SEED,
      address: process.env.XMR_SIMPLE_WALLET_ADDRESS
    }))
  }

  return new Wallet({ holdings })

}

