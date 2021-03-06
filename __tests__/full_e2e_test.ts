require('dotenv').config()

import { loadWallet } from '../src/wallet'

describe("Anypay Payment Protocol Live", () => {

  const coins = [
    /*'BTC',
    'BSV',
    'BCH',
    'DASH',
    'DOGE',
    'LTC',
    */
    'XMR'
  ]

  for (let coin of coins) {

    test(`${coin} payments`, async () => {

      let wallet = await loadWallet()

      try {

        let { uid } = await wallet.receive({
          currency: 'USD',
          value: 1
        })

        var uri

        let payment = await wallet.payInvoice(uid, coin)

        let invoice = await wallet.getInvoice(uid)

        expect(invoice.status).toBe('paid')

      } catch(error) {

        console.error(error)

        expect(false).toEqual(true)

      }

    })
  }


});

