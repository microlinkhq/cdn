'use strict'

import createTimeSpan from '@kikobeats/time-span'
import { readFile } from 'fs/promises'
import prettyMs from 'pretty-ms'
import got from 'got'

const URLS = await readFile(new URL('../urls.json', import.meta.url), 'utf8').then(JSON.parse)

const timeSpan = createTimeSpan({ format: prettyMs })

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

const cloudflare = got.extend({
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

for (const files of chunks(URLS, CLOUDFLARE_MAX_FILES)) {
  await cloudflare('purge_cache', {
    method: 'POST',
    body: JSON.stringify({ files })
  })
  process.stdout.write(' ' + total() + ' ')
}

process.stdout.write('✨\n')
