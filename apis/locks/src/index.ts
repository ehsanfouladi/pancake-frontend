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
import { getNfts, getTotalNumberOfUserNfts } from './v3'
import { Address } from 'viem'

const router = Router()

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

