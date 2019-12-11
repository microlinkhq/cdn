'use strict'

const { gray } = require('chalk')
const { description } = require('../package')

module.exports = `${description}.

Usage
  ${gray('$ microlink-cdn [flags]')}

Flags
  ${gray('--all             Regenerate all assets.')}
  ${gray("--banner          Create banner assets used on README's.")}
  ${gray('--data            data files from demo links.')}
  ${gray('--screenshots     Create demo links screenshots.')}

  ${gray('--concurrency     Adjust concurrency level [default=2].')}
`
