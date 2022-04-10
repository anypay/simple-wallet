require('dotenv').config()

import { getRPC } from './rpc'

import BigNumber from 'bignumber.js'

import { getBitcore, toSatoshis } from './bitcore'

import { Invoice } from './invoice'

import { Client } from './client'

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

  async payInvoice(invoice_uid: string, asset:string) {

    // TODO: Get Actual Payment Request

    let client = new Client(`https://api.anypayx.com/i/${invoice_uid}`)

    let options = await client.getPaymentOptions()

    let paymentRequest = await client.selectPaymentOption({
      chain: asset,
      currency: asset
    })

    let { instructions } = paymentRequest

    let wallet = this.asset(asset)

    console.log({ instructions })

    let balance = await wallet.balance()

    console.log({ balance })

    let bitcore = getBitcore(asset)

    let privatekey = new bitcore.PrivateKey(wallet.privatekey)

    console.log({ unspent: wallet.unspent })

    console.log({ address: wallet.address })

    var tx;

    if (asset === 'LTC') {

      let inputs = wallet.unspent.map(output => {
        return {
          txId: output.txid,
          outputIndex: output.vout,
          address: output.address,
          script: output.redeemScript,
          scriptPubKey: output.scriptPubKey,
          satoshis: output.amount * 100000000
        }
      })

      console.log({ inputs })

      tx = new bitcore.Transaction()
        .from(inputs)
        .change(wallet.address)

    } else {

      tx = new bitcore.Transaction()
        .from(wallet.unspent)
        .change(wallet.address)

    }


    // TODO: Use actual outputs from payment request

    for (let output of instructions[0].outputs) {

      console.log({ output })

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

    console.log({ tx })

    console.log(tx.toString('hex'))

    let response = await client.transmitPayment(paymentRequest, tx.toString('hex'))

  }

  asset(asset: string) {
    return this.holdings.filter(holding => holding.asset === asset)[0]
  }

  async newInvoice(newInvoice: { amount: number, currency: string }): Promise<Invoice> {
    return new Invoice()

  }

  buildPayment(outputs: any[]) {

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

  return new Wallet({ holdings })

}

