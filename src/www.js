'use strict'

const browserless = require('browserless')()
const { reduce } = require('lodash')
const pAll = require('p-all')

const { writeFile, randomGradient } = require('./util')
const { websiteUrl } = require('./constant')

const PAGES = {
  home: { url: websiteUrl },
  'docs/sdk': { url: `${websiteUrl}/docs/sdk/getting-started/overview` },
  'docs/mql': { url: `${websiteUrl}/docs/mql/getting-started/overview` },
  'docs/api': { url: `${websiteUrl}/docs/api/getting-started/overview` },
  embed: { url: `${websiteUrl}/embed` },
  screenshot: { url: `${websiteUrl}/screenshot` },
  chat: { url: `${websiteUrl}/chat` },
  privacy: { url: `${websiteUrl}/privacy` },
  tos: { url: `${websiteUrl}/tos` },
  design: { url: `${websiteUrl}/design` },
  status: { url: `${websiteUrl}/status` },
  styleguide: { url: `${websiteUrl}/styleguide` },
  pricing: { url: websiteUrl, scrollTo: '#pricing' },
  blog: { url: `${websiteUrl}/blog` }
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
