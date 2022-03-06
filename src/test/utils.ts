
require('dotenv').config()

import * as chai from 'chai'

const expect = chai.expect

const spies = require('chai-spies');

chai.use(spies);

var spy = chai.spy.sandbox()

export { spy }

export { expect, chai }

import { Wallet, Currencies } from '../'

const WIF = process.env.ANYPAY_SIMPLE_WALLET_WIF

if (!WIF) {
  
  throw new Error('process.env.ANYPAY_SIMPLE_WALLET_WIF must be set before running tests.')

}

let wallet = Wallet.fromWIF(WIF)

export { wallet }

before(async () => {
  let { amount, currency } = await wallet.getBalance(Currencies.EUR)

  var Table = require('cli-table');

  var table = new Table({
      head: ['Currency', 'Address', 'Balance']
    , colWidths: [10, 50, 20]
  });

  table.push(
    ['BSV', wallet.address, `${amount} ${currency}`]
  );

  console.log(table.toString());
  console.log('\n');

})

