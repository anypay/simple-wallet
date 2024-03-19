require('dotenv').config()

import config from '../src/config';

import { Card, loadWallet } from '../src/wallet'

import { MnemonicWallet } from '../src/mnemonic_wallet';

import { log } from '../src/log'

describe("Anypay Payment Protocol Live", () => {

  it.skip("should construct and send a payment", async () => {
  })
  /*
  
  const mnemonic = config.get('SIMPLE_WALLET_SEED_PHRASE') || "caught use excite course ridge lava broom galaxy crane slight best oppose"

  const { cards } = new MnemonicWallet(mnemonic)

  const coins = [
    //'BTC',
    //'BSV',
    //'BCH',
    'DASH',
    //'DOGE',
    //'LTC',
    //'XMR'
  ]

  for (let coin of coins) {

    test(`${coin} payments`, async () => {

      //let wallet = await loadWallet(cards)

      try {

        /*const paymentRequest = await wallet.receive({
          currency: 'USD',
          value: 1
        })
        */


                        /*


        const { uid } = paymentRequest;

        const payment = await wallet.payInvoice(uid, coin)

        //log.info('payment.created', payment)

        const invoice = await wallet.getInvoice(uid)

        expect(invoice.status).toBe('paid')

      } catch(error) {

        console.log(error)      

      }

    })
  }
  */


});

