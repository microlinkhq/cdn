'use strict'

const demoLinks = require('@microlink/demo-links')
const browserless = require('browserless')()
const { stringify } = require('querystring')
const beautyError = require('beauty-error')
const cartesian = require('cartesian')
const { reduce } = require('lodash')
const pAll = require('p-all')

const { writeFile, randomGradient } = require('./util')
const { websiteUrl } = require('./constant')

const fileOpts = cartesian({
  type: ['png'],
  browser: [undefined, 'safari-dark', 'safari-light']
})

module.exports = async ({ task, concurrency }) => {
  const total = Object.keys(demoLinks).length * fileOpts.length
  let index = 0

  const downloadFiles = reduce(
    demoLinks,
    (acc, { url, ...demoLinkOpts }, name) => {
      const files = fileOpts.map(({ type, browser }) => {
        const dist = `dist/embed/${
          browser ? `browser/${browser.split('-')[1]}/` : ''
        }${name.toLocaleLowerCase()}.${type}`

        const background = randomGradient()
        let screenshotUrl

        return async () => {
          try {
            task.setProgress(name, ++index, total)

            screenshotUrl = `${websiteUrl}/embed?${stringify({ url })}`

            const buffer = await browserless.screenshot(screenshotUrl, {
              waitFor: 3000,
              disableAnimations: true,
              waitUntil: ['load'],
              type,
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
