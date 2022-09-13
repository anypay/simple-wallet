require('dotenv').config()

import config from '../src/config';

import { Card, loadWallet } from '../src/wallet'

import { MnemonicWallet } from '../src/mnemonic_wallet';

import { log } from '../src/log'

describe("Anypay Payment Protocol Live", () => {

  const mnemonic = config.get('simple_wallet_seed_phrase')

  if (!mnemonic) {

    log.error('no simple_wallet_seed_phrase config variable set')

    log.error("Please run `docker run wallet-bot seed-phrase` to generate a new empty wallet")

    process.exit(1)

  }

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

      let wallet = await loadWallet(cards)

      console.log(cards)

      try {

        const paymentRequest = await wallet.receive({
          currency: 'USD',
          value: 1
        })

        log.info('payment-request.created', paymentRequest)

        const { uid } = paymentRequest;

        const payment = await wallet.payInvoice(uid, coin)

        log.info('payment.created', payment)

        const invoice = await wallet.getInvoice(uid)

        expect(invoice.status).toBe('paid')

      } catch(error) {

        console.error(error)

        expect(false).toEqual(true)

      }

    })
  }


});

