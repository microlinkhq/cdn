'use strict'

const demoLinks = require('@microlink/demo-links')
const browserless = require('browserless')()
const { size, reduce } = require('lodash')
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
      const dist = `dist/screenshot/${id}.${type}`
      const background = randomGradient()
      const screenshotUrl = `${WWW_URL}/www/screenshot/${id}`

      const fn = async () => {
        task.setProgress(id, ++index, total)
        const buffer = await browserless.screenshot(screenshotUrl, {
          type,
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
