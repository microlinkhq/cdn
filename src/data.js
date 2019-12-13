'use strict'

const { map, chain, isNil, get, reduce } = require('lodash')
const demoLinks = require('@microlink/demo-links')
const filenamifyUrl = require('filenamify-url')
const mql = require('@microlink/mql')
const download = require('download')
const pAll = require('p-all')
const path = require('path')

const { CDN_URL, MICROLINK_API_KEY } = require('./env')
const { writeFile } = require('./util')

const API_MEDIA_PROPS = ['logo', 'screenshot', 'video', 'audio', 'image']

const getMediaAssetPath = (data, propName) => {
  const propValue = get(data, `${propName}.url`)
  const type = get(data, `${propName}.type`)
  const dirname = `/data/assets/${filenamifyUrl(data.url)}`
  const basename = filenamifyUrl(type ? `${propValue}.${type}` : propValue)
  const filepath = `${dirname}/${basename}`
  return { dirname, basename, filepath }
}

const toMapLocalAsset = data => {
  const mapper = reduce(
    API_MEDIA_PROPS,
    (acc, propName) => {
      const propValue = get(data, propName)
      if (propValue) {
        const { filepath } = getMediaAssetPath(data, propName)
        const url = `${CDN_URL}${filepath}`
        acc[propName] = { ...propValue, url }
      }
      return acc
    },
    {}
  )

  return { ...data, ...mapper }
}

const toDownload = async data => {
  const assets = chain(API_MEDIA_PROPS)
    .map(propName => ({
      propName,
      propValue: get(data, propName)
    }))
    .filter(({ propValue }) => !isNil(propValue))
    .value()

  const downloads = assets.map(({ propName, propValue }) => {
    const { dirname, basename } = getMediaAssetPath(data, propName)
    const dist = path.join(path.resolve('dist'), dirname)
    return download(propValue.url, dist, { filename: basename })
  })

  return Promise.all(downloads)
}

module.exports = async ({ task, concurrency }) => {
  const total = Object.keys(demoLinks).length
  const buffer = []
  let index = 0

  const downloadLink = ({ url, ...props }, name) => {
    const id = name.toLowerCase()
    const dist = `dist/data/${id}.json`

    return async () => {
      task.setProgress(id, ++index, total)
      const { data: rawData } = await mql(url, {
        apiKey: MICROLINK_API_KEY,
        retry: 2,
        force: true,
        palette: true,
        iframe: true,
        ...props
      })
      if (!rawData.lang) rawData.lang = 'en'
      await toDownload(rawData)
      const data = toMapLocalAsset(rawData)
      buffer.push({ id, data })
      return writeFile(JSON.stringify(data, null, 2), dist)
    }
  }

  const links = map(demoLinks, downloadLink)

  await pAll(links, { concurrency })
  await writeFile(JSON.stringify(buffer, null, 2), 'dist/data/all.json')
}
