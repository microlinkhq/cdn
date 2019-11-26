'use strict'

const demoLinks = require('@microlink/demo-links')
const browserless = require('browserless')()
const { size, reduce } = require('lodash')
const pAll = require('p-all')

const { writeFile, randomGradient } = require('./util')
const { websiteUrl } = require('./constant')

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
      const screenshotUrl = `${websiteUrl}/screenshot/${id}`

      const fn = async () => {
        try {
          task.setProgress(name, ++index, total)
          const buffer = await browserless.screenshot(screenshotUrl, {
            type,
            waitUntil: ['load', 'networkidle0'],
            overlay: { background },
            ...demoLinkOpts
          })
          return writeFile(buffer, dist)
        } catch (err) {
          console.log('URL Failed', url, screenshotUrl)
        }
      }
      return [...acc, fn]
    },
    []
  )
  await pAll(downloadFiles, { concurrency })
}
