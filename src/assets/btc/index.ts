

import * as bitcore from '@anypay/bitcore-lib';

export { bitcore }

import { Utxo } from '../../wallet'

import { listUnspent as blockchainInfoListUnspent } from '../../blockchain.info'

export const rpc = {

    listUnspent: async function(address: string): Promise<Utxo[]> {

        return blockchainInfoListUnspent('BTC', address)

    },

    getBalance: async function(address: string): Promise<number> {

        const utxos = await blockchainInfoListUnspent('BTC', address)

        return utxos.reduce((sum, {value}) => sum + value, 0)
        
    }
}

