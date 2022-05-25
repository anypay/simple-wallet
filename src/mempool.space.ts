
import axios from 'axios'

export async function getRecommendedFees() {

  let { data } = await axios.get('https://mempool.space/api/v1/fees/recommended')

  return data

}

