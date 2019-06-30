'use strict'

const Listr = require('listr')
const { reduce } = require('lodash')

const pkg = require('../package.json')

const TASKS = {
  banners: require('../src/banner'),
  brands: require('../src/brand'),
  pages: require('../src/page')
}

const cli = require('meow')({
  pkg,
  flags: {
    concurrency: {
      default: 2
    },
    pages: {
      type: 'boolean',
      default: true
    },
    banners: {
      type: 'boolean',
      default: true
    },
    brands: {
      type: 'boolean',
      default: true
    }
  }
})

const tasks = reduce(
  TASKS,
  (acc, fn, key) => {
    if (cli.flags[key]) {
      acc.push({
        title: key,
        task: (ctx, task) => fn({ ...cli.flags, task })
      })
    }
    return acc
  },
  []
)

const build = new Listr(tasks, {
  concurrent: true
})

build
  .run()
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
  .then(() => {
    process.exit()
  })
