'use strict'

const browserless = require('browserless')()
const { reduce } = require('lodash')
const pAll = require('p-all')

const { writeFile, randomGradient } = require('./util')
const { WWW_URL } = require('./env')

const PAGES = {
  home: { url: WWW_URL },
  'docs/sdk': { url: `${WWW_URL}/docs/sdk/getting-started/overview` },
  'docs/mql': { url: `${WWW_URL}/docs/mql/getting-started/overview` },
  'docs/api': { url: `${WWW_URL}/docs/api/getting-started/overview` },
  embed: { url: `${WWW_URL}/embed` },
  screenshot: { url: `${WWW_URL}/screenshot` },
  chat: { url: `${WWW_URL}/chat` },
  privacy: { url: `${WWW_URL}/privacy` },
  tos: { url: `${WWW_URL}/tos` },
  design: { url: `${WWW_URL}/design` },
  status: { url: `${WWW_URL}/status` },
  styleguide: { url: `${WWW_URL}/styleguide` },
  pricing: { url: WWW_URL, scrollTo: '#pricing' },
  blog: { url: `${WWW_URL}/blog` }
}

const FILE_TYPES = ['png', 'jpeg']

module.exports = async ({ task, concurrency }) => {
  const total = Object.keys(PAGES).length
  let index = 0
  const takeScreenshots = reduce(
    PAGES,
    (acc, { url, ...opts }, name) => {
      const background = randomGradient()
      const files = FILE_TYPES.map(fileType => {
        const id = name.toLowerCase()
        const dist = `dist/www/${id}.${fileType}`
        return async () => {
          task.setProgress(id, ++index, total)
          const buffer = await browserless.screenshot(url, {
            hide: ['.crisp-client', '#cookies-policy'],
            waitFor: 8000,
            type: fileType,
            overlay: { background },
            ...opts
          })

          return writeFile(buffer, dist)
        }
      })

      return acc.concat(files)
    },
    []
  )

  await pAll(takeScreenshots, { concurrency })
}
