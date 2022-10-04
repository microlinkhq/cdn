'use strict'

const fs = require('fs')
const path = require('path')

const files = fs.readdirSync('.').filter(file => {
  const extname = path.extname(file)
  const basename = path.basename(file, extname)
  return basename !== 'index'
})

files.forEach(file => {
  const extname = path.extname(file)
  const basename = path.basename(file, extname)
  if (basename !== 'sample') fs.renameSync(file, `sample${extname}`)
})

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
  <ul>${files
    .map(file => `<li><a href="${encodeURI(file)}">${decodeURI(file)}</a></li>`)
    .join('\n')}</ul>
</body>
</html>`

fs.writeFileSync('index.html', html)
fs.writeFileSync('index.json', JSON.stringify(files, null, 2))

console.log(`\nGenerated ${files.length} files ✨`)
