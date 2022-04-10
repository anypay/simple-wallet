
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
}

export class RpcClient {

  url: string;

  constructor(params: RpcOptions) {

    this.url = params.url
  }

  async listUnspent(address: string): Promise<UTXO[]> {

    let method = 'listunspent'

    let params = [0, 0, `["${address}"]`]

    let { data } = await axios.post(this.url, params, {
      headers: {}
    })

    return data

  }

}

export async function listUnspent(address): Promise<UTXO[]> {

  let rpc = new RpcClient({
    url: process.env.BCH_RPC_URL
  })

  return rpc.listUnspent(address)

}


