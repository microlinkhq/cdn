'use strict'

const Listr = require('listr')

const buildBanner = require('./banner')
const buildMeta = require('./meta')

const OPTIONS = { endpoint: 'https://meta.microlink.io', concurrency: 2 }

const tasks = new Listr(
  [
    {
      title: 'Build Banners',
      task: (ctx, task) => buildBanner({ ...OPTIONS, task })
    },
    {
      title: 'Build Meta',
      task: (ctx, task) => buildMeta({ ...OPTIONS, task })
    }
  ],
  {
    concurrent: true
  }
)

tasks.run().catch(err => {
  console.error(err)
  process.exit(1)
})
