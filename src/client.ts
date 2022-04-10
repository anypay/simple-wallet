
import axios from 'axios'

import * as protocol from './protocol'

import { Wallet } from './wallet'

import { broadcast } from './run'

export class Client {

  url: string;

  constructor(url: string) {

    this.url = url

  }

  async getPaymentOptions(): Promise<protocol.PaymentOptions> {

    let { data } = await axios.get(this.url, {
      headers: {
        'x-paypro-version': 2,
        'accept': 'application/payment-options'
      }
    })

    return data

  }

  async selectPaymentOption(params: protocol.SelectPaymentRequest): Promise<protocol.PaymentRequest> {

    let { data } = await axios.post(this.url, params, {
      headers: {
        'x-paypro-version': 2,
        'content-type': 'application/payment-request'
      }
    })

    return data

  }

  async verifyPayment(params: protocol.PaymentVerificationRequest): Promise<protocol.PaymentVerification> {

    let { data } = await axios.post(this.url, params, {
      headers: {
        'x-paypro-version': 2,
        'content-type': 'application/payment-verification'
      }
    })

    return data

  }

  async transmitPayment(

    params: protocol.PaymentRequest,

    transaction: string

  ): Promise<protocol.PaymentResponse> {

    const payment: protocol.SendPayment = {

      chain: params.chain,

      currency: params.chain,

      transactions: [{ tx: transaction }]
    }

    let { data } = await axios.post(this.url, payment, {
      headers: {
        'x-paypro-version': 2,
        'content-type': 'application/payment'
      }
    })

    //broadcast(transaction).then(console.log).catch(console.error)

    console.log(data)

    return data

  }

  async sendPayment(

    wallet: Wallet,

    params: protocol.PaymentRequest

  ): Promise<protocol.PaymentResponse> {

    let transaction: any = await wallet.buildPayment(params.instructions[0].outputs)

    return this.transmitPayment(params, transaction)


  }

}
