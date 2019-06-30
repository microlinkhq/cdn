'use strict'

const uniqueRandomArray = require('unique-random-array')
const calcPercent = require('calc-percent')
const mql = require('@microlink/mql')
const { reduce } = require('lodash')
const pAll = require('p-all')

const { downloadFile } = require('./util')

const PAGES = {
  home: 'https://microlink.io',
  'docs/sdk': 'https://microlink.io/docs/sdk/getting-started/overview',
  'docs/mql': 'https://microlink.io/docs/mql/getting-started/overview',
  'docs/api': 'https://microlink.io/docs/api/getting-started/overview',
  embed: 'https://microlink.io/embed',
  chat: 'https://microlink.io/chat',
  privacy: 'https://microlink.io/privacy',
  tos: 'https://microlink.io/tos',
  design: 'https://microlink.io/design',
  styleguide: 'https://microlink.io/styleguide',
  pricing: 'https://microlink.io/#pricing',
  blog: 'https://microlink.io/blog'
}

const COLORS = ['#F76698', '#EA407B', '#654EA3']

const randColor = uniqueRandomArray(COLORS)

const FILE_TYPES = ['png', 'jpeg']

module.exports = async ({ task, endpoint, concurrency }) => {
  const total = Object.keys(PAGES).length
  let index = 0
  const takeScreenshots = reduce(
    PAGES,
    (acc, url, name) => {
      const color = randColor()
      const files = FILE_TYPES.map(fileType => {
        const dist = `dist/page/${name}.${fileType}`
        return async () => {
          const increment = ++index / concurrency
          const percent = calcPercent(increment, total, { suffix: '%' })
          task.output = `(${percent}) ${increment} of ${total} ${name}`

          const { data } = await mql(url, {
            hide: ['.crisp-client', '#cookies-policy'],
            endpoint: 'http://localhost:3000',
            screenshot: true,
            type: fileType,
            background: color
          })

          return downloadFile(data.screenshot.url, dist)
        }
      })

      return acc.concat(files)
    },
    []
  )

  await pAll(takeScreenshots, { concurrency })
}
