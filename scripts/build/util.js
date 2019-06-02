'use strict'

const debug = require('debug-logfmt')('microlink-cdn')
const download = require('download')
const fs = require('fs-extra')

const downloadFile = async (url, dist) => {
  await fs.ensureFile(dist)
  const data = await download(url)
  debug('writing', dist)
  await fs.writeFile(dist, data)
}

module.exports = { downloadFile }
