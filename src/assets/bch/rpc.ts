
import axios from 'axios'

export interface UTXO {
  txid: string;
  vout: number;
  address: string;
  account: string;
  scriptPubKey: string;
  amount: number;
  confirmations: number;
  spendable: boolean;
  solvable: boolean;
  safe: boolean;
}

interface RpcOptions {
  url: string;
  username?: string;
  password?: string;
}

export class RpcClient {

  url: string;
  username: string;
  password: string

  constructor(params: RpcOptions) {

    this.url = params.url
    this.username = params.username || process.env.BCH_RPC_USER
    this.password = params.password || process.env.BCH_RPC_PASSWORD
  }

  async listUnspent(address: string): Promise<UTXO[]> {

    let method = 'listunspent'

    let params = [0, 9999999, [`${address}`]]

    let response = await axios.post(this.url, {method, params}, {

      auth: {
        username: this.username,
        password: this.password
      }

    })

    return response.data.result

  }

}

import { Balance } from '../../wallet'

export async function getBalance(address): Promise<Balance> {

  const asset = 'BCH'

  const { data } = await axios.get(`https://api.blockchair.com/bitcoin-cash/dashboards/address/${address}`)

  const { balance: value, balance_usd: value_usd } = data['data'][address]['address']

  return { asset, address, value, value_usd }

}

export async function listUnspent(address): Promise<UTXO[]> {

  let rpc = new RpcClient({
    url: process.env.BCH_RPC_URL
  })

  return rpc.listUnspent(address)

}


