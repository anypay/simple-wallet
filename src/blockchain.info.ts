

import { Utxo } from './wallet'

import config from './config'

import axios from 'axios'

import { log } from './log'

class BlockchainInfoError extends Error {}

interface BlockchainInfoUtxo {
    tx_hash_big_endian: string;
    tx_hash: string;
    tx_output_n: number;
    script: string;
    value: number;
    value_hex: string;
    confirmations: number;
    tx_index: number;
}

export async function listUnspent(coin: string, address: string): Promise<Utxo[]> {

    if (coin !== 'BTC') {

        throw new BlockchainInfoError('Only BTC supported on blockchain.info')

    }

    try {

        const key = config.get('crypto_apis_io_api_key')

        const { data } = await axios.get(`https://blockchain.info/unspent?active=${address}`)

        return data.unspent_outputs.map((output: BlockchainInfoUtxo) => {

            return {
                txid: output.tx_hash,
                vout: output.tx_output_n,
                value: output.value,
                scriptPubKey: output.script
            }
        })

    } catch(err) {

        const error = new BlockchainInfoError(err.message)

        log.error('blockchain.info.api.error', error)

        throw error
    }
}