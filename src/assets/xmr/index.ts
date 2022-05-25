
/*const WalletManager = require('@mymonero/mymonero-wallet-manager')({})

const walletManager = new WalletManager('STAGENET', 'https://stagenet-api.mymonero.rtfm.net')

walletManager.init()
  .then(() => console.log('mymonero.walletmanger.initialized'))
  .catch((error) => console.error('mymonero.walletmanger.init.failed', error))

*/

import axios from 'axios'

import { Client } from 'payment-protocol'

const bitcore = {

}

export { bitcore }

import * as rpc from './rpc'

export { rpc }

export async function buildPayment(paymentRequest) {

  let client = new Client(paymentRequest.paymentUrl)

  let result = await client.paymentRequest({
    chain: 'XMR',
    currency: 'XMR'
  })

  let destinations = result.instructions[0].outputs

  let { tx_blob, tx_key, tx_hash } = await transfer(destinations)

  console.log({ tx_blob, tx_key, tx_hash })

  return tx_blob

}

export async function call(method: string, params: any): Promise<any> {

  let { data } = await axios.post(process.env.XMR_RPC_URL, {
    jsonrpc:"2.0",
    id:"0",
    method,
    params
  }, {
    auth: {
      username: process.env.XMR_RPC_USER,
      password: process.env.XMR_RPC_PASSWORD
    }
  })

  return data.result

}

interface Destination {
  address: string;
  amount: number;
}

export async function transfer(destinations: Destination[]) {

  return call('transfer', {
    get_tx_hex: true,
    get_tx_key: true,
    get_tx_metadata: true,
    do_not_relay: true,
    destinations
  })

}



