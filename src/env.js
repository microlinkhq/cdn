'use strict'

const {
  WWW_URL = 'https://microlink.io',
  CDN_URL = 'https://cdn.microlink.io',
  CARDS_URL = 'https://i.microlink.io/https%3A%2F%2Fcards.microlink.io%2F%3Fpreset%3Dmicrolink%26',
  ...env
} = process.env

module.exports = {
  ...env,
  WWW_URL,
  CDN_URL,
  CARDS_URL
}
