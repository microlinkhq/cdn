'use strict'

const {
  WWW_URL = 'https://microlink.io',
  CDN_URL = 'https://cdn.microlink.io',
  META_URL = 'https://meta.microlink.io',
  ...env
} = process.env

module.exports = {
  ...env,
  WWW_URL,
  CDN_URL,
  META_URL
}
