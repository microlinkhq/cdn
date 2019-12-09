'use strict'

const demoLinks = require('@microlink/demo-links')
const browserless = require('browserless')()
const cartesian = require('cartesian')
const { reduce } = require('lodash')
const pAll = require('p-all')

const { writeFile } = require('./util')

const fileOpts = cartesian({
  type: ['png'],
  browser: [undefined, 'dark', 'light']
})

module.exports = async ({ task, concurrency }) => {
  const total = Object.keys(demoLinks).length * fileOpts.length
  let index = 0

  const downloadFiles = reduce(
    demoLinks,
    (acc, { url, ...demoLinkOpts }, name) => {
      const files = fileOpts.map(({ type, browser }) => {
        const browserSkin = typeof browser === 'string' ? browser : undefined
        const id = name.toLowerCase()
        const dist = `dist/screenshot/${
          browserSkin ? `browser/${browserSkin}/` : ''
        }${id}.${type}`

        return async () => {
          task.setProgress(id, ++index, total)
          const buffer = await browserless.screenshot(url, {
            disableAnimations: true,
            type,
            waitUntil: ['load', 'networkidle0'],
            omitBackground: false,
            overlay: { browser },
            ...demoLinkOpts
          })
          return writeFile(buffer, dist)
        }
      })
      return acc.concat(files)
    },
    []
  )
  await pAll(downloadFiles, { concurrency })
}
