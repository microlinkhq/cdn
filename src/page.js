'use strict'

const browserless = require('browserless')()
const { reduce } = require('lodash')
const pAll = require('p-all')

const { writeFile, randomGradient } = require('./util')

const PAGES = {
  home: 'https://microlink.io',
  'docs/sdk': 'https://microlink.io/docs/sdk/getting-started/overview',
  'docs/mql': 'https://microlink.io/docs/mql/getting-started/overview',
  'docs/api': 'https://microlink.io/docs/api/getting-started/overview',
  embed: 'https://microlink.io/embed',
  screenshot: 'https://microlink.io/screenshot',
  chat: 'https://microlink.io/chat',
  privacy: 'https://microlink.io/privacy',
  tos: 'https://microlink.io/tos',
  design: 'https://microlink.io/design',
  styleguide: 'https://microlink.io/styleguide',
  pricing: 'https://microlink.io/#pricing',
  blog: 'https://microlink.io/blog'
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
