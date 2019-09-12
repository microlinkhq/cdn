'use strict'

const browserless = require('browserless')()
const { reduce } = require('lodash')
const pAll = require('p-all')

const { writeFile, randomGradient } = require('./util')
const { websiteUrl } = require('./constant')

const PAGES = {
  home: `${websiteUrl}`,
  'docs/sdk': `${websiteUrl}/docs/sdk/getting-started/overview`,
  'docs/mql': `${websiteUrl}/docs/mql/getting-started/overview`,
  'docs/api': `${websiteUrl}/docs/api/getting-started/overview`,
  embed: `${websiteUrl}/embed`,
  screenshot: `${websiteUrl}/screenshot`,
  chat: `${websiteUrl}/chat`,
  privacy: `${websiteUrl}/privacy`,
  tos: `${websiteUrl}/tos`,
  design: `${websiteUrl}/design`,
  styleguide: `${websiteUrl}/styleguide`,
  pricing: `${websiteUrl}/#pricing'`,
  blog: `${websiteUrl}/blog`
}

const FILE_TYPES = ['png', 'jpeg']

module.exports = async ({ task, concurrency }) => {
  const total = Object.keys(PAGES).length
  let index = 0
  const takeScreenshots = reduce(
    PAGES,
    (acc, url, name) => {
      const background = randomGradient()
      const files = FILE_TYPES.map(fileType => {
        const dist = `dist/page/${name}.${fileType}`
        return async () => {
          task.setProgress(name, ++index, total)

          const buffer = await browserless.screenshot(url, {
            hide: ['.crisp-client', '#cookies-policy'],
            type: fileType,
            overlay: { background }
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
