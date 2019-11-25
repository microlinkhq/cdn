'use strict'

const { gray } = require('chalk')
const { description } = require('../package')

module.exports = `${description}.

Usage
  ${gray('$ microlink-cdn [flags]')}

Flags
  ${gray('--all           Regenerate all assets.')}
  ${gray('--banner        Create banner assets used on READMEs')}
  ${gray(
    '--embed         Create `microlink.io/embed` previews for demo links.'
  )}
  ${gray(
    '--screenshot    Create `microlink.io/screenshot` previews for demo links.'
  )}
  ${gray('--page          Create specific page screenshots.')}
  ${gray('--website       Create demo links screenshots.')}
  ${gray('--concurrency   Adjust concurrency level [default=2].')}
`
