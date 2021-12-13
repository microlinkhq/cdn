'use strict'

const { URLSearchParams } = require('url')
const { reduce } = require('lodash')
const pAll = require('p-all')

const { downloadFile } = require('./util')
const { CARDS_URL } = require('./env')

const TEXT = {
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
const THEMES = ['light', 'dark']

module.exports = async ({ task, concurrency }) => {
  const total = Object.keys(TEXT).length * FILE_TYPES.length
  let index = 0
  const downloadFiles = reduce(
    TEXT,
    (acc, text, name) => {
      const files = []

      for (const fileType of FILE_TYPES) {
        for (const theme of THEMES) {
          const query = new URLSearchParams({
            preset: 'microlink',
            title: text,
            'screenshot.type': fileType,
            ...(theme === 'dark' ? { bg: '#0E1117' } : {})
          }).toString()

          const url = `${CARDS_URL}/${encodeURIComponent(
            `https://cards.microlink.io/?${query}`
          )}`

          const variation = theme === 'dark' ? '-dark' : ''
          const dist = `dist/banner/${name}${variation}.${fileType}`

          files.push(() => {
            task.setProgress(name, index++, total)
            return downloadFile(url, dist)
          })
        }
      }

      return [...acc, ...files]
    },
    []
  )

  await pAll(downloadFiles, { concurrency })
}
