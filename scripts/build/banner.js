'use strict'

const calcPercent = require('calc-percent')
const querystring = require('querystring')
const { reduce } = require('lodash')
const pAll = require('p-all')

const { downloadFile } = require('./util')

const TEXT = {
  sdk: 'Microlink SDK',
  cdn: 'Microlink CDN',
  api: 'Microlink API',
  mql: 'Microlink Query Language',
  chat: 'Microlink Chat',
  docs: 'Microlink Docs',
  cli: 'Microlink CLI',
  html: 'Microlink HTML'
}

const FILE_TYPES = ['png', 'jpeg']

module.exports = async ({ task, endpoint, concurrency }) => {
  const total = Object.keys(TEXT).length
  let index = 0
  const downloadFiles = reduce(
    TEXT,
    (acc, text, name) => {
      const files = FILE_TYPES.map(fileType => {
        const queryParams = querystring.stringify({
          theme: 'light',
          md: '1',
          fontSize: '100px',
          images: 'https://cdn.microlink.io/logo/logo.svg'
        })

        const url = `${endpoint}/${text}.${fileType}?${queryParams}`
        const dist = `dist/banner/${name}.${fileType}`

        return () => {
          const increment = ++index / concurrency
          const percent = calcPercent(increment, total, { suffix: '%' })
          task.output = `(${percent}) ${increment} of ${total} ${text}`
          return downloadFile(url, dist)
        }
      })

      return acc.concat(files)
    },
    []
  )

  await pAll(downloadFiles, { concurrency })
}
