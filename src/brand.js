'use strict'

const demoLinks = require('@microlink/demo-links')
const calcPercent = require('calc-percent')
const querystring = require('querystring')
const { reduce } = require('lodash')
const pAll = require('p-all')
const { URL } = require('url')

const { downloadFile } = require('./util')

const FILE_TYPES = ['png', 'jpeg']

module.exports = async ({ task, concurrency }) => {
  const total = Object.keys(demoLinks).length
  let index = 0
  const downloadFiles = reduce(
    demoLinks,
    (acc, { url }, name) => {
      const files = FILE_TYPES.map(fileType => {
        const { hostname } = new URL(url)
        const queryParams = querystring.stringify({
          theme: 'light',
          md: '1',
          fontSize: '100px',
          images: [
            'https://cdn.microlink.io/logo/logo.svg',
            `https://logo.clearbit.com/${hostname}`
          ]
        })

        const metaUrl = `https://meta.microlink.io/.${fileType}?${queryParams}`
        const dist = `dist/brand/${name.toLocaleLowerCase()}.${fileType}`

        return () => {
          const increment = ++index / concurrency
          const percent = calcPercent(increment, total, { suffix: '%' })
          task.output = `(${percent}) ${increment} of ${total} ${name}`
          return downloadFile(metaUrl, dist)
        }
      })

      return acc.concat(files)
    },
    []
  )

  await pAll(downloadFiles, { concurrency: 2 })
}
