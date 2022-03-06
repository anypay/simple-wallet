
import { Client, Wallet } from '../'

import { expect } from './utils'

import axios from 'axios'

import { wallet } from './utils'

const base = !!process.env.ANYPAY_SIMPLE_WALLET_DEV ? 'http://localhost:8000' : 'https://api.anypayinc.com'

describe('JSON Payment Protocol', () => {

  it("should get test payment options from Anypay", async () => {

    try {

      let { uid } = await createInvoice(0.02)

      let client = new Client(`${base}/i/${uid}`)

      const paymentOptions = await client.getPaymentOptions();

      expect(paymentOptions).to.not.be.equal(undefined)

    } catch(error) {

      console.log({ error })

    }

  })

  it("should get test payment request from Anypay", async () => {

    try {

      let { uid } = await createInvoice(0.02)

      let client = new Client(`${base}/i/${uid}`)

      const { paymentOptions } = await client.getPaymentOptions();

      let paymentOption = paymentOptions.filter(option => option.currency === 'BSV')[0]

      let paymentRequest = await client.selectPaymentOption(paymentOption)

      expect(paymentRequest).to.not.be.equal(undefined)

    } catch(error) {

      console.log({ error })

    }

  })


  it("should pay a payment from Anypay", async () => {

    try {

      let { uid } = await createInvoice(0.02)

      let client = new Client(`${base}/i/${uid}`)

      const { paymentOptions } = await client.getPaymentOptions();

      let paymentOption = paymentOptions.filter(option => option.currency === 'BSV')[0]

      let paymentRequest = await client.selectPaymentOption(paymentOption)

      let payment = await client.sendPayment(wallet, paymentRequest)

    } catch(error) {

      console.log({ error })

    }

  })

})

async function createInvoice(amount: number) {

  let { data } = await axios.post(`http://localhost:8000/accounts/1177/invoices`, {

    amount

  })

  return data

}
