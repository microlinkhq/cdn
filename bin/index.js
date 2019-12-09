#!/usr/bin/env node

'use strict'

const calcPercent = require('calc-percent')
const beautyError = require('beauty-error')
const pReflect = require('p-reflect')
const { reduce } = require('lodash')
const Listr = require('listr')

const pkg = require('../package.json')

const TASKS = {
  banner: require('../src/banner'),
  page: require('../src/'),
  screenshots: require('../src/screenshots'),
  data: require('../src/data'),
  'www-screenshots': require('../src/www-screenshots'),
  'www-embed': require('../src/www-embed'),
  www: require('../src/www')
}

const cli = require('meow')({
  pkg,
  description: false,
  help: require('./help'),
  flags: {
    concurrency: {
      default: 3
    }
  }
})

const setProgress = (task, { concurrency }) => (name, index, total) => {
  const increment = ++index / concurrency
  const percent = calcPercent(increment, total, { suffix: '%' })
  task.output = `(${percent}) ${Math.round(increment)} of ${total} ${name}`
}

const createTasks = flags =>
  reduce(
    TASKS,
    (acc, fn, key) => {
      if (flags[key] || flags.all) {
        acc.push({
          title: key,
          task: async (ctx, task) => {
            task.setProgress = setProgress(task, flags)
            const { isRejected } = await pReflect(fn({ ...flags, task }))
            if (isRejected) console.log('URL Failed', task)
          }
        })
      }
      return acc
    },
    []
  )

const tasks = createTasks(cli.flags)

const build = new Listr(tasks, {
  concurrent: true
})

build
  .run()
  .then(() => {
    process.exit()
  })
  .catch(err => {
    console.error(beautyError(err))
    process.exit(1)
  })
