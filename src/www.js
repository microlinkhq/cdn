'use strict'

const browserlessFactory = require('browserless')()
const { reduce } = require('lodash')
const pAll = require('p-all')

const { writeFile, randomGradient } = require('./util')
const { WWW_URL, SCREENSHOT_VIEWPORT } = require('./env')

const PAGES = {
  'docs/api': { url: `${WWW_URL}/docs/api/getting-started/overview` },
  'docs/mql': { url: `${WWW_URL}/docs/mql/getting-started/overview` },
  'docs/sdk': { url: `${WWW_URL}/docs/sdk/getting-started/overview` },
  blog: { url: `${WWW_URL}/blog` },
  chat: { url: `${WWW_URL}/chat` },
  design: { url: `${WWW_URL}/design`, waitForTimeout: 8000 },
  meta: { url: `${WWW_URL}/meta` },
  home: {
    url: WWW_URL,
    styles: ['#analytics { visibility: hidden; }']
  },
  enterprise: { url: `${WWW_URL}/enterprise` },
  pricing: { url: `${WWW_URL}/#pricing` },
  privacy: { url: `${WWW_URL}/privacy` },
  screenshot: { url: `${WWW_URL}/screenshot` },
  pdf: { url: `${WWW_URL}/pdf` },
  status: { url: `${WWW_URL}/status` },
  styleguide: { url: `${WWW_URL}/styleguide` },
  tos: { url: `${WWW_URL}/tos` }
}

const FILE_TYPES = ['png', 'jpeg']

module.exports = async ({ task, concurrency }) => {
  const total = Object.keys(PAGES).length * FILE_TYPES.length
  let index = 0
  const takeScreenshots = reduce(
    PAGES,
    (acc, { url, styles = [], ...opts }, name) => {
      const background = randomGradient()
      const files = FILE_TYPES.map(fileType => {
        const id = name.toLowerCase()
        const dist = `dist/www/${id}.${fileType}`

        return async () => {
          task.setProgress(id, index++, total)
          const browserless = await browserlessFactory.createContext()
          const buffer = await browserless.screenshot(url, {
            hide: ['.crisp-client', '#cookies-policy'],
            type: fileType,
            overlay: { background },
            viewport: {
              width: 2400,
              height: 1260,
              deviceScaleFactor: 1
            },
            waitForTimeout: 3000,
            styles: ['html { zoom: 1.5; }', ...styles],
            ...opts
          })
          await browserless.destroyContext()
          return writeFile(buffer, dist)
        }
      })

      return [...acc, ...files]
    },
    []
  )

  await pAll(takeScreenshots, { concurrency })
  await browserlessFactory.close()
}
