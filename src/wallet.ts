
import { Currency, Currencies } from './currency'

import * as Run from 'run-sdk'

import * as bsv from 'bsv'

import axios from 'axios'

const run = new Run()

import { PrivateKey } from 'bsv'

import BigNumber from 'bignumber.js'

import * as filepay from 'filepay'

import * as protocol from './protocol'

export enum Networks {
  BSV,
  BCH,
  BTC,
  DASH,
  LTC,
  DOGE,
  XMR,
  XRP,
  ETH,
  SOL
}

interface NewWallet {

  privateKey: PrivateKey;

}

export type BalanceLoading = any;

import { Balance, convertBalance } from './balance'

type integer = number;

interface Unspent {
  satoshis: integer;
  script: string;
  txid: string;
  vout: integer;
}

interface Output {
  address: string;
  amount: number;
}

export class Wallet {
  
  privateKey: PrivateKey;

  run: Run;

  balance: number;

  unspent: Unspent[];

  constructor(newWallet: NewWallet) {

    this.privateKey = newWallet.privateKey

    this.getUnspentOutputs()

  }

  get address(): string {

    return this.privateKey.toAddress().toString()
  }

  static fromWIF(wif: string, network: Networks = Networks.BSV): Wallet {

    switch(network) {

      case Networks.BSV:

        const privateKey = new PrivateKey(wif)

        return new Wallet({ privateKey })

      default:

        throw new UnsupportedNetworkError()

    }


  }

  static create(network: Networks): Wallet {

    const privateKey = new PrivateKey()

    return new Wallet({ privateKey })

  }

  async getBalance(currency: Currency = Currencies.Satoshis): Promise<BalanceLoading | Balance> {

    let outputs = await this.getUnspentOutputs()

    this.balance = outputs.reduce((sum, output) => {

      return sum.plus(output.satoshis)

    }, new BigNumber(0)).toNumber()

    var amount = this.balance

    if (currency !== Currencies.Satoshis) {

      let converted = await convertBalance({ amount, currency: Currencies.Satoshis }, currency)

      amount = converted.amount

    }

    return {

      currency,

      amount

    }

  }

  private async getUnspentOutputs() {

    this.unspent = await run.blockchain.utxos(this.address)

    return this.unspent

  }

  async buildPayment(outputs: Output[]) {

    await this.getUnspentOutputs()

    let inputs = this.unspent.map(utxo => {

      return {
        value: utxo.satoshis,
        script: utxo.script,
        txid: utxo.txid,
        outputIndex: utxo.vout
      }

    })

    return new Promise((resolve, reject) => {

      filepay.build({

        pay: {

          key: this.privateKey.toWIF(),

          inputs,

          to: outputs.map(output => {

            return {

              script: new bsv.Script(new bsv.Address(output.address)).toHex(),

              value: output.amount

            }

          })
        }
      }, (error, transaction) => {

        if (error) { return reject(error) }

        resolve(transaction.serialize())

      });

    })

  }

}

export class UnsupportedNetworkError implements Error {

  name = "UnsupportedWalletNetwork"

  message = "Wallet Network Not Supported"

}

