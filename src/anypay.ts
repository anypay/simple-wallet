
import { app } from 'anypay'

let token = process.env.ANYPAY_APP_TOKEN

const anypay = app(token);

export { anypay }

