
import { app } from 'anypay'

const apiKey = String(process.env.ANYPAY_APP_TOKEN)

const anypay = app({
    apiKey
})

export default anypay
