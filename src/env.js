'use strict'

const {
  WWW_URL = 'https://microlink.io',
  CDN_URL = 'https://cdn.microlink.io',
  CARDS_URL = 'https://screenshot.microlink.io',
  ...env
} = process.env

module.exports = {
  ...env,
  WWW_URL,
  CDN_URL,
  CARDS_URL
}
