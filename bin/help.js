'use strict'

const { gray } = require('picocolors')
const { description } = require('../package')

module.exports = `${description}.

Usage
  ${gray('$ microlink-cdn [flags]')}

Flags
  ${gray('--all             Regenerate all assets.')}
  ${gray("--banner          Create banner assets used on README's.")}
  ${gray('--data            Create data files demo links.')}
  ${gray('--screenshots     Create screenshot per every demo link.')}
  ${gray('--www             Create shareable screenshot used at microlink.io.')}

  ${gray('--concurrency     Adjust concurrency level [default=2].')}
`
