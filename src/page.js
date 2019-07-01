'use strict'

const uniqueRandomArray = require('unique-random-array')
const browserless = require('browserless')()
const { reduce } = require('lodash')
const pAll = require('p-all')

const { writeFile } = require('./util')

const PAGES = {
  home: 'https://microlink.io',
  'docs/sdk': 'https://microlink.io/docs/sdk/getting-started/overview',
  'docs/mql': 'https://microlink.io/docs/mql/getting-started/overview',
  'docs/api': 'https://microlink.io/docs/api/getting-started/overview',
  embed: 'https://microlink.io/embed',
  chat: 'https://microlink.io/chat',
  privacy: 'https://microlink.io/privacy',
  tos: 'https://microlink.io/tos',
  design: 'https://microlink.io/design',
  styleguide: 'https://microlink.io/styleguide',
  pricing: 'https://microlink.io/#pricing',
  blog: 'https://microlink.io/blog'
}

const COLORS = [
  'linear-gradient(225deg, #FF057C 0%, #8D0B93 50%, #321575 100%)',
  'linear-gradient(225deg, #A445B2 0%, #D41872 52%, #FF0066 100%)',
  'linear-gradient(225deg, #AC32E4 0%, #7918F2 48%, #4801FF 100%)',
  'linear-gradient(225deg, #22E1FF 0%, #1D8FE1 48%, #625EB1 100%)',
  'linear-gradient(225deg, #2CD8D5 0%, #6B8DD6 48%, #8E37D7 100%)',
  'linear-gradient(90deg, #495AFF 0%, #0ACFFE 100%)',
  'linear-gradient(0deg, #6713D2 0%, #CC208E 100%)',
  'linear-gradient(270deg, #EC8C69 0%, #ED6EA0 100%)',
  'linear-gradient(0deg, #FE5196 0%, #F77062 100%)',
  'linear-gradient(270deg, #F9D423 0%, #F83600 100%)',
  'linear-gradient(270deg, #FE9A8B 0%, #FD868C 41%, #F9748F 73%, #F78CA0 100%)',
  'linear-gradient(0deg, #6F86D6 0%, #48C6EF 100%)',
  'linear-gradient(0deg, #FA71CD 0%, #C471F5 100%)',
  'linear-gradient(270deg, #6A11CB 0%, #2575FC 100%)',
  'linear-gradient(270deg, #B465DA 0%, #CF6CC9 28%, #EE609C 68%, #EE609C 100%)',
  'linear-gradient(0deg, #330867 0%, #30CFD0 100%)',
  'linear-gradient(270deg, #FEE140 0%, #FA709A 100%)'
]
const randColor = uniqueRandomArray(COLORS)

const FILE_TYPES = ['png', 'jpeg']

module.exports = async ({ task, concurrency }) => {
  const total = Object.keys(PAGES).length
  let index = 0
  const takeScreenshots = reduce(
    PAGES,
    (acc, url, name) => {
      const color = randColor()
      const files = FILE_TYPES.map(fileType => {
        const dist = `dist/page/${name}.${fileType}`
        return async () => {
          task.setProgress(name, ++index, total)

          const buffer = await browserless.screenshot(url, {
            hide: ['.crisp-client', '#cookies-policy'],
            type: fileType,
            overlay: {
              background: color
            }
          })

          return writeFile(buffer, dist)
        }
      })

      return acc.concat(files)
    },
    []
  )

  await pAll(takeScreenshots, { concurrency })
}
