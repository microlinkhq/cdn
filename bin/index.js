#!/usr/bin/env node

'use strict'

const calcPercent = require('calc-percent')
const beautyError = require('beauty-error')
const { reduce } = require('lodash')
const Listr = require('listr')

const pkg = require('../package.json')

const TASKS = {
  banner: require('../src/banner'),
  page: require('../src/wwww'),
  screenshots: require('../src/screenshots'),
  'www-screenshots': require('../src/www-screenshots'),
  'www-embed': require('../src/www-embed')
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
  task.output = `(${percent}) ${increment} of ${total} ${name}`
}

const createTasks = flags =>
  reduce(
    TASKS,
    (acc, fn, key) => {
      if (flags[key] || flags.all) {
        acc.push({
          title: key,
          task: (ctx, task) => {
            task.setProgress = setProgress(task, flags)
            return fn({ ...flags, task })
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
