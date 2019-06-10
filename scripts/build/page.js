'use strict'

const uniqueRandomArray = require('unique-random-array')
const browserless = require('browserless')()
const calcPercent = require('calc-percent')
const { reduce } = require('lodash')
const pAll = require('p-all')

const { writeFile } = require('./util')

const PAGES = {
  home: 'https://microlink.io',
  docs: 'https://microlink.io/docs',
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
          const buffer = await browserless.screenshot(url, {
            removeElements: ['.crisp-client', '#cookies-policy'],
            overlay: { color },
            type: fileType
          })
          return writeFile(dist, buffer)
        }
      })

      return acc.concat(files)
    },
    []
  )

  await pAll(takeScreenshots, { concurrency })
}
