'use strict'

const demoLinks = require('@microlink/demo-links')
const browserless = require('browserless')()
const { reduce, size } = require('lodash')
const pAll = require('p-all')

const { writeFile, randomGradient } = require('./util')
const { WWW_URL } = require('./env')

module.exports = async ({ task, concurrency }) => {
  const total = size(demoLinks)
  let index = 0

  const downloadFiles = reduce(
    demoLinks,
    (acc, { url, ...demoLinkOpts }, name) => {
      const type = 'png'
      const id = name.toLowerCase()
      const dist = `dist/www/embed/${id}.${type}`
      const background = randomGradient()
      const screenshotUrl = `${WWW_URL}/www/embed/${id}`

      const fn = async () => {
        task.setProgress(id, ++index, total)
        const buffer = await browserless.screenshot(screenshotUrl, {
          type,
          waitFor: '#sdk',
          waitUntil: ['load', 'networkidle0'],
          overlay: { background },
          ...demoLinkOpts
        })
        return writeFile(buffer, dist)
      }
      return [...acc, fn]
    },
    []
  )
  await pAll(downloadFiles, { concurrency })
}
