'use strict'

const { gray } = require('chalk')
const { description } = require('../package')

module.exports = `${description}.

Usage
  ${gray('$ microlink-cdn [flags]')}

Flags
  ${gray('--all             Regenerate all assets.')}
  ${gray("--banner          Create banner assets used on README's.")}
  ${gray('--screenshots     Create demo links screenshots.')}
  ${gray('--www             Create specific page screenshots.')}
  ${gray(
    '--www-embed       Create `microlink.io/embed` previews for demo links.'
  )}
  ${gray(
    '--www-screenshot  Create `microlink.io/screenshot` previews for demo links.'
  )}

  ${gray('--concurrency     Adjust concurrency level [default=2].')}
`
