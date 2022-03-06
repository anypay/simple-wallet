
import { expect } from './utils'

import { Wallet, Currencies, Networks } from '../'

import * as bsv from 'bsv'

const wif = process.env.ANYPAY_SIMPLE_WALLET_WIF

describe("Anypay Simple Wallet", () => {

  it("should create a wallet from WIF", async () => {

    let wallet = Wallet.fromWIF(wif)

    let { amount, currency } = await wallet.getBalance(Currencies.Satoshis)

    expect(amount).to.be.greaterThanOrEqual(0)

    expect(currency).to.be.equal(Currencies.Satoshis)

  })

  it("should get the wallet address from WIF", async () => {

    let wallet = Wallet.fromWIF(wif)

    new bsv.Address(wallet.address)

    expect(wallet.address).to.be.a('string')

  })

  it("should create a new random Wallet", async () => {

    let wallet = Wallet.create(Networks.BSV)

    let { amount, currency } = await wallet.getBalance(Currencies.Satoshis)

    expect(currency).to.be.equal('satoshis')

    expect(amount).to.be.equal(0)

  })

  describe('With a Balance > 0', () => {

    it("should create a wallet from WIF", async () => {

      let wallet = Wallet.fromWIF(wif, Networks.BSV)

      let { amount, currency } = await wallet.getBalance(Currencies.Satoshis)

      expect(amount).to.be.greaterThan(0)

      expect(currency).to.be.equal(Currencies.Satoshis)

    })

    it("should get thh balance in EUR", async () => {

      let wallet = Wallet.fromWIF(wif, Networks.BSV)

      let { amount, currency } = await wallet.getBalance(Currencies.EUR)

      expect(amount).to.be.greaterThan(0)

      expect(currency).to.be.equal(Currencies.EUR)

    })

  })

})
