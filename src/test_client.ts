
import axios from 'axios'

import * as protocol from './protocol'

import { Wallet } from './wallet'

export class TestClient {

  url: string;

  supertest: any

  constructor(supertest: any, url: string) {

    this.supertest = supertest

    this.url = url

  }

  async getPaymentOptions(): Promise<protocol.PaymentOptions> {

    let { result } = await this.supertest.inject({
      method: 'GET',
      url: this.url,
      headers: {
        'x-paypro-version': 2,
        'accept': 'application/payment-options'
      }
    })

    return result

  }

  async selectPaymentOption(params: protocol.SelectPaymentRequest): Promise<protocol.PaymentRequest> {

    let { result } = await this.supertest.inject({
      method: "POST",
      url: this.url,
      payload: params,
      headers: {
        'x-paypro-version': 2,
        'content-type': 'application/payment-request'
      }
    })

    return result

  }

  async verifyPayment(params: protocol.PaymentVerificationRequest): Promise<protocol.PaymentVerification> {

    let { result } = await this.supertest.inject({
      method: 'POST',
      url: this.url, 
      payload: params,
      headers: {
        'x-paypro-version': 2,
        'content-type': 'application/payment-verification'
      }
    })

    return result

  }

  async sendPayment(

    wallet: Wallet,

    params: protocol.PaymentRequest

  ): Promise<protocol.PaymentResponse> {

    let transaction: any = await wallet.buildPayment(params.instructions[0].outputs, params.chain)

    const payment: protocol.SendPayment = {

      chain: params.chain,

      currency: params.chain,

      transactions: [{ tx: transaction }]
    }

    let { result } = await this.supertest({
      method: "POST",
      url: this.url,
      payload: payment,
      headers: {
        'x-paypro-version': 2,
        'content-type': 'application/payment'
      }
    })

    return result

  }

}

