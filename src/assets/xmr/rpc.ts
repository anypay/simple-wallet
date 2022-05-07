
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

  async getBalance(): Promise<number> {

    const method = 'get_balance'

    const params = {
      "account_index":0,
      "address_indices":[0,1]
    }

    let { data } = await axios.post(this.url, {method,params}, {
      auth: {
        username: process.env.XMR_RPC_USER,
        password: process.env.XMR_RPC_PASSWORD
      }
    })

    return data.result

  }

  async listUnspent(address: string): Promise<UTXO[]> {

    let method = 'listunspent'

    //let params = [0, 9999999, `["${address}"]`]
    let params = [0, 9999999, [address]]

    let { data } = await axios.post(this.url, {method,params}, {
      auth: {
        username: process.env.XMR_RPC_USER,
        password: process.env.XMR_RPC_PASSWORD
      }
    })

    return data.result

  }

}

export async function listUnspent(address): Promise<UTXO[]> {

  let rpc = new RpcClient({
    url: process.env.XMR_RPC_URL
  })

  return rpc.listUnspent(address)

}

export async function getBalance(address): Promise<number> {

  let rpc = new RpcClient({
    url: process.env.XMR_RPC_URL
  })

  return rpc.getBalance()

}



