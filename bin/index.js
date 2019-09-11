#!/usr/bin/env node

'use strict'

const calcPercent = require('calc-percent')
const { reduce } = require('lodash')
const Listr = require('listr')

const pkg = require('../package.json')

const TASKS = {
  banner: require('../src/banner'),
  brand: require('../src/brand'),
  page: require('../src/page'),
  screenshot: require('../src/screenshot'),
  embed: require('../src/embed')
}

const cli = require('meow')({
  pkg,
  flags: {
    concurrency: {
      default: 2
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
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
  .then(() => {
    process.exit()
  })
