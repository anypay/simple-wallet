#!/usr/bin/env ts-node

import { program } from 'commander'

import { loadWallet } from '../wallet'

program
  .command('balances')
  .action(async () => {

    try {

      let wallet = await loadWallet()

      let balances = await wallet.balances()

      console.log({ balances })

    } catch (error) {

      console.error(error)

    }

  })

program
  .command('balance <asset>')
  .action(async (asset) => {

    try {

      let wallets = await loadWallet()

      let wallet = wallets.asset(asset)

      let balance = await wallet.balance()

      console.log({ balance })

    } catch(error) {

      console.error(error)

    }

  })

program
  .command('pay <invoice_uid> <asset>')
  .action(async (invoice_uid, asset) => {

    try {

      let wallet = await loadWallet()

      let payment = await wallet.payInvoice(invoice_uid, asset)

      console.log({ payment })

    } catch(error) {

      console.error(error)

    }

  })

program
  .command('receive <value> <currency>')
  .action(async (value, currency) => {

    try {

      let wallet = await loadWallet()

      let invoice = await wallet.receive({
        currency, value
      })

      console.log({ invoice })

    } catch(error) {

      console.error(error)

    }

  })

program.parse(process.argv)
