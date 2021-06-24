'use strict'

const { reduce } = require('lodash')
const pAll = require('p-all')

const { downloadFile } = require('./util')
const { CARDS_URL } = require('./env')

const TEXT = {
  'mql-cli': 'MQL CLI',
  api: 'Microlink API',
  blog: 'Microlink Blog',
  cards: 'Microlink Cards',
  cdn: 'Microlink CDN',
  changelog: 'Microlink Changelog',
  community: 'Microlink Community',
  cli: 'Microlink CLI',
  design: 'Microlink Design',
  docs: 'Microlink Docs',
  html: 'Microlink HTML',
  insights: 'Microlink Insights',
  meta: 'Microlink Meta',
  mql: 'Microlink Query Language',
  oss: 'Microlink OSS',
  pdf: 'Microlink PDF',
  proxy: 'Microlink Proxy',
  recipes: 'Microlink Recipes',
  screenshot: 'Microlink Screenshot',
  sdk: 'Microlink SDK',
  stats: 'Microlink Stats',
  status: 'Microlink Status',
  enterprise: 'Microlink Enterprise'
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
