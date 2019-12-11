'use strict'

const querystring = require('querystring')
const { reduce } = require('lodash')
const pAll = require('p-all')

const { META_URL, CDN_URL } = require('./env')
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
  sdk: 'Microlink SDK'
}

const FILE_TYPES = ['png', 'jpeg']

module.exports = async ({ task, concurrency }) => {
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
          images: `${CDN_URL}/logo/logo.svg`
        })

        const url = `${META_URL}/${text}.${fileType}?${queryParams}`
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
