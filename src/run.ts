
import axios from 'axios'

export interface RunUtxo {
  txid: string;
  vout: number;
  script: string;
  satoshis: number;
}

export async function broadcast (rawtx) {

  const { data } = await axios.post(`https://api.run.network/v1/main/tx`, {
    rawtx
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

  return data
}


