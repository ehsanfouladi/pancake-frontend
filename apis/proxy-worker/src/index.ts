import { Router } from 'itty-router'
import { missing, error } from 'itty-router-extras'
// import { CORS_ALLOW, handleCors, wrapCorsHeader } from '@pancakeswap/worker-utils'
export const CORS_ALLOW = [
  /\.pancake\.run$/,
  /\.pancakeswap\.finance$/,
  /\.cadinu\.io$/,
  /\.pancakeswap\.com$/,
  /\.cadinu\.io$/,
  'https://pancakeswap.finance',
  'https://apps.cadinu.io',
  'https://pancakeswap.com',
  'https://cadinu.io',
  /^http:\/\/localhost(:\d+)?$/,
]

function isString(s: any): s is string {
  return typeof s === 'string' || s instanceof String
}

function isOriginAllowed(origin: string | null, allowedOrigin: any) {
  if (allowedOrigin === '*') return true
  if (Array.isArray(allowedOrigin)) {
    for (let i = 0; i < allowedOrigin.length; ++i) {
      if (isOriginAllowed(origin, allowedOrigin[i])) {
        return true
      }
    }
    return false
  }
  if (isString(allowedOrigin)) {
    return origin === allowedOrigin
  }
  if (origin && allowedOrigin instanceof RegExp) {
    return allowedOrigin.test(origin)
  }
  return !!allowedOrigin
}

  const wrapCorsHeader = (request: Request, response: Response, options: any = {}) => {
  const { allowedOrigin = '*' } = options
  const reqOrigin = request.headers.get('origin')
  const isAllowed = isOriginAllowed(reqOrigin, allowedOrigin)
  const newResponse = new Response(response.body, response)

  newResponse.headers.set('Access-Control-Allow-Origin', isAllowed ? reqOrigin || '' : '')

  return newResponse
}

  const handleCors = (allowedOrigin: any, methods: string, headers: string) => (request: Request) => {
  const reqOrigin = request.headers.get('origin')
  const isAllowed = isOriginAllowed(reqOrigin, allowedOrigin)
  if (isAllowed && reqOrigin) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': reqOrigin,
      'Access-Control-Allow-Methods': methods,
      'Access-Control-Allow-Headers': headers,
    }
    // Handle CORS pre-flight request.
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }
  console.info('Origin not allowed on handleCors', reqOrigin)
  // Handle standard OPTIONS request.
  return new Response(null, {
    headers: {
      Allow: methods,
    },
  })
}

const _corsMethods = `POST, OPTIONS`
const _corsHeaders = `referer, origin, content-type, x-sf`

const router = Router()

router.post('/bsc-exchange', async (request, _, headers: Headers) => {
  const ip = headers.get('X-Forwarded-For') || headers.get('Cf-Connecting-Ip') || ''
  const isLocalHost = headers.get('origin') === 'http://localhost:3000'
  const body = (await request.text?.()) as any

  if (!body) return error(400, 'Missing body')

  const response = await fetch(NODE_REAL_DATA_ENDPOINT, {
    headers: {
      'X-Forwarded-For': ip,
      origin: isLocalHost ? 'https://apps.cadinu.io' : headers.get('origin') || '',
    },
    body,
    method: 'POST',
  })

  return response
})

router.options('*', handleCors(CORS_ALLOW, _corsMethods, _corsHeaders))

router.all('*', () => missing('Not found'))

addEventListener('fetch', (event) =>
  event.respondWith(
    router
      .handle(event.request, event, event.request.headers)
      .then((res) => wrapCorsHeader(event.request, res, { allowedOrigin: CORS_ALLOW })),
  ),
)
