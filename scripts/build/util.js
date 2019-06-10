'use strict'

const debug = require('debug-logfmt')('microlink-cdn')
const download = require('download')
const fs = require('fs-extra')

const writeFile = async (dist, data) => {
  debug('writing', dist)
  await fs.ensureFile(dist)
  return fs.writeFile(dist, data)
}

const downloadFile = async (url, dist) => {
  debug('downloading', url)
  const data = await download(url)
  return writeFile(dist, data)
}

module.exports = { writeFile, downloadFile }
