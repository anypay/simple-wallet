
# Anypay Simple Wallet

For building apps which control money and most importantly
for testing anypay in production

## Installation

```
npm install --save anypay-simple-wallet
```

### Usage

The Wallet implements the JSON Payment Protocol V2 Spec
compatible with AnypayX.com and Bitpay.com


```
import { Wallet } from 'anypay-simple-wallet'

let wallet = Wallet.fromWIF(process.env.WIF)

let balance = await wallet.getBalance()

let transaction = await wallet.buildTransaction([{
  address: "1VxvyqNXXYdC8xHSW8VQTsHbrCdG2BBJ6",
  amount: 5000,
}, {
  address: "17du1ERGCG4Cwpm2N4GQHzKo8R3XVEJ33t",
  amount: 5000
}])

```

