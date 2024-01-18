'use strict'

const prettyMs = require('pretty-ms')

const timeSpan = require('@kikobeats/time-span')({ format: prettyMs })

const URLS = require('../urls.json')

const {
  CLOUDFLARE_MAX_FILES = 30,
  CLOUDFLARE_AUTH_EMAIL,
  CLOUDFLARE_AUTH_KEY,
  CLOUDFLARE_ZONE_ID
} = process.env

const chunks = (array, size) =>
  array.reduce((result, item, index) => {
    const chunkSize = Math.floor(index / size)
    if (!result[chunkSize]) result[chunkSize] = []
    result[chunkSize].push(item)
    return result
  }, [])

const cloudflare = require('got').extend({
  prefixUrl: `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/`,
  throwHttpErrors: false,
  responseType: 'json',
  resolveBodyOnly: true,
  headers: {
    'user-agent': undefined,
    'x-auth-email': CLOUDFLARE_AUTH_EMAIL,
    'x-auth-key': CLOUDFLARE_AUTH_KEY
  }
})

const total = timeSpan()

;(async () => {
  for (const files of chunks(URLS, CLOUDFLARE_MAX_FILES)) {
    await cloudflare('purge_cache', {
      method: 'POST',
      body: JSON.stringify({ files })
    })
    process.stdout.write(' ' + total() + ' ')
  }
  process.stdout.write('✨\n')
})()
