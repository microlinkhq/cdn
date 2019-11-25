'use strict'

const demoLinks = require('@microlink/demo-links')
const browserless = require('browserless')()
const beautyError = require('beauty-error')
const { stringify } = require('querystring')
const { reduce } = require('lodash')
const cartesian = require('cartesian')
const pAll = require('p-all')

const { writeFile, randomGradient } = require('./util')
const { websiteUrl } = require('./constant')

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
        const browserSkin =
          typeof browser === 'string' ? browser.split('-')[1] : undefined

        const dist = `dist/screenshot/${
          browserSkin ? `browser/${browserSkin}/` : ''
        }${name.toLocaleLowerCase()}.${type}`

        const opts = { waitFor: 5000 }
        const background = randomGradient()
        let screenshotUrl

        return async () => {
          try {
            task.setProgress(name, ++index, total)

            screenshotUrl = `${websiteUrl}/screenshot?${stringify({
              url,
              browser: browserSkin
            })}`

            const buffer = await browserless.screenshot(screenshotUrl, {
              ...opts,
              disableAnimations: true,
              type,
              waitUntil: ['load'],
              overlay: { browser, background },
              ...demoLinkOpts
            })
            return writeFile(buffer, dist)
          } catch (err) {
            console.error(url)
            console.log(screenshotUrl)
            console.error(beautyError(err))
          }
        }
      })
      return acc.concat(files)
    },
    []
  )
  await pAll(downloadFiles, { concurrency })
}
