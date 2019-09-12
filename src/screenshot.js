'use strict'

const demoLinks = require('@microlink/demo-links')
const browserless = require('browserless')()
const { stringify } = require('querystring')
const { reduce, omit } = require('lodash')
const cartesian = require('cartesian')
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
    omit(demoLinks, [
      'Ars',
      'Engadget',
      'TheWashingtonPost',
      'CNN',
      'TED',
      'Twitch',
      'Vimeo',
      'Twitter',
      'Vimeo'
    ]),
    (acc, { url, ...demoLinkOpts }, name) => {
      const files = fileOpts.map(({ type, browser }) => {
        const dist = `dist/screenshot/${
          browser ? `browser/${browser.split('-')[1]}/` : ''
        }${name.toLocaleLowerCase()}.${type}`

        const opts = { waitFor: 3000 }
        const background = randomGradient()

        return async () => {
          task.setProgress(name, ++index, total)
          const buffer = await browserless.screenshot(
            `${websiteUrl}/screenshot?${stringify({
              url,
              ...opts,
              ...browser
            })}`,
            {
              ...opts,
              disableAnimations: true,
              type,
              overlay: { browser, background },
              ...demoLinkOpts
            }
          )
          return writeFile(buffer, dist)
        }
      })
      return acc.concat(files)
    },
    []
  )
  await pAll(downloadFiles, { concurrency })
}
