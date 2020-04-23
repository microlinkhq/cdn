'use strict'

const { reduce } = require('lodash')
const pAll = require('p-all')

const { CARDS_URL } = require('./env')
const { downloadFile } = require('./util')

const TEXT = {
  api: 'Microlink API',
  cdn: 'Microlink CDN',
  chat: 'Microlink Chat',
  cli: 'Microlink CLI',
  docs: 'Microlink Docs',
  html: 'Microlink HTML',
  mql: 'Microlink Query Language',
  'mql-cli': 'MQL CLI',
  proxy: 'Microlink Proxy',
  sdk: 'Microlink SDK',
  cards: 'Microlink Cards'
}

const FILE_TYPES = ['png', 'jpeg']

module.exports = async ({ task, concurrency }) => {
  const total = Object.keys(TEXT).length
  let index = 0
  const downloadFiles = reduce(
    TEXT,
    (acc, text, name) => {
      const files = FILE_TYPES.map(fileType => {
        const query = encodeURIComponent(
          `title=${encodeURIComponent(text)}&screenshot.type=${fileType}`
        )
        const url = `${CARDS_URL}${query}`

        const dist = `dist/banner/${name}.${fileType}`

        return () => {
          task.setProgress(name, ++index, total)
          return downloadFile(url, dist)
        }
      })

      return [...acc, ...files]
    },
    []
  )

  await pAll(downloadFiles, { concurrency })
}
