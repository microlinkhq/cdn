'use strict'

const Listr = require('listr')

const buildBanner = require('./banner')
const buildBrand = require('./brand')
const buildPage = require('./page')

const OPTIONS = { endpoint: 'https://meta.microlink.io', concurrency: 2 }

const tasks = new Listr(
  [
    {
      title: 'Build Banners',
      task: (ctx, task) => buildBanner({ ...OPTIONS, task })
    },
    {
      title: 'Build Brands',
      task: (ctx, task) => buildBrand({ ...OPTIONS, task })
    },
    {
      title: 'Build Pages',
      task: (ctx, task) => buildPage({ ...OPTIONS, task })
    }
  ],
  {
    concurrent: true
  }
)

tasks
  .run()
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
  .then(() => {
    process.exit()
  })
