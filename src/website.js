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
        const dist = `dist/website/${
          browserSkin ? `browser/${browserSkin}/` : ''
        }${id}.${type}`

        return async () => {
          try {
            task.setProgress(name, ++index, total)
            const buffer = await browserless.screenshot(url, {
              disableAnimations: true,
              type,
              waitUntil: ['load', 'networkidle0'],
              overlay: { browser },
              ...demoLinkOpts
            })
            return writeFile(buffer, dist)
          } catch (err) {
            console.log('URL Failed', url)
          }
        }
      })
      return acc.concat(files)
    },
    []
  )
  await pAll(downloadFiles, { concurrency })
}
