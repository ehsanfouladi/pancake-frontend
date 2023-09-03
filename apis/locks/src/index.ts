/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Router } from 'itty-router'
import { error, json, missing } from 'itty-router-extras'
import { wrapCorsHeader, handleCors, CORS_ALLOW } from '@pancakeswap/worker-utils'
import { getNfts, getTotalNumberOfUserNfts, getPrice } from './v3'
import { Address, isAddress } from 'viem'
import { getV2Price } from './v2'



const router = Router()
router.get('/price/:token', async ({params})=>{
  if(!params){
    return error(400, 'Invalid params')
  }
  if(params){
    const token = params!.token.toLowerCase()
    if(!isAddress(token)){
      return error(400, 'Invalid token address')
    }
    const finalPrice = async ()=>{ 
      const prices = await getPrice(token)
      for (const key in prices){
        // console.info(key)
        if (Number(prices[key])) {
          return prices[key]
        }
      }
      const v2prices = await getV2Price(token)
      for (const key in v2prices){
        if (Number(v2prices[key])) {
          return v2prices[key]
        }
      }
      return 0
    }
    
    return json({price: await finalPrice()})
  }
})

router.get('/v3/getNfts/:user/:positionManager', async ({params})=>{
  if (!params) {
    return error(400, 'Invalid params')
  }
  const { user, positionManager} = params!
  const nfts = await getNfts(user as Address, positionManager)
  const balanceOf = await getTotalNumberOfUserNfts(user as Address, positionManager)
  console.log(balanceOf);
  
  
  return json({"balanceOf" :Number(balanceOf).toString(),nfts})
  
  
})

router.all('*', () => missing('Not found'))

router.options('*', handleCors(CORS_ALLOW, `GET, HEAD, OPTIONS`, `referer, origin, content-type`))

addEventListener('fetch', (event) =>
  event.respondWith(
    router
      .handle(event.request, event)
      .then((res) => wrapCorsHeader(event.request, res, { allowedOrigin: CORS_ALLOW })),
  ),
)

