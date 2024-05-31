'use strict'

import { statSync, readdirSync } from 'fs'
import { writeFile } from 'fs/promises'
import prettyBytes from 'pretty-bytes'
import prettier from 'prettier'
import path from 'path'

const IGNORE_FILES = ['.DS_Store', 'data', 'index.html']
const URLS = []

const formatNumber = n => Number(n).toLocaleString('en-US')

const directorySize = dirPath => {
  let size = 0

  const getSize = currentPath => {
    const items = readdirSync(currentPath)
    items.forEach(item => {
      const fullPath = path.join(currentPath, item)
      const stats = statSync(fullPath)
      if (stats.isDirectory()) {
        getSize(fullPath)
      } else {
        size += stats.size
      }
    })
  }

  getSize(dirPath)
  return size
}

const rootStats = directoryPath => {
  let dirs = 0
  let files = 0

  const countItems = itemPath => {
    const items = readdirSync(itemPath)
    items.forEach(item => {
      const fullPath = path.join(itemPath, item)
      if (statSync(fullPath).isDirectory()) {
        dirs++
        countItems(fullPath)
      } else {
        files++
      }
    })
  }

  countItems(directoryPath)
  const size = prettyBytes(directorySize(directoryPath))
  return { dirs, files, size }
}

const rootPath = process.argv[2]
const baseUrl = process.argv[3]

if (!rootPath || !baseUrl) {
  console.error(
    'Please provide both a directory path and a base URL as command-line arguments.'
  )
  process.exit(1)
}

const getRelativeUrl = (baseUrl, itemPath) => {
  const baseUrlParts = baseUrl.split('/')
  const itemPathParts = itemPath.replace(`${rootPath}/`, '').split('/')

  let commonPartIndex = 0

  while (
    commonPartIndex < baseUrlParts.length &&
    commonPartIndex < itemPathParts.length &&
    baseUrlParts[commonPartIndex] === itemPathParts[commonPartIndex]
  ) {
    commonPartIndex++
  }

  const resultPathParts = itemPathParts.slice(commonPartIndex)
  const resultPath = resultPathParts.join('/')

  return '/' + resultPath
}

const generateTreeView = (directoryPath, baseUrl, prefix = '', level = 0) => {
  const items = readdirSync(directoryPath).filter(
    item => !IGNORE_FILES.includes(item)
  )

  let html = `<ul class="tree-view ${level > 0 ? 'nested' : ''}">`

  items.forEach((item, index) => {
    const itemId = `directory-${Math.random().toString(36).slice(2, 11)}`
    const itemPath = path.join(directoryPath, item)
    const stats = statSync(itemPath)
    const isDirectory = stats.isDirectory()
    const size = prettyBytes(isDirectory ? directorySize(itemPath) : stats.size)
    const isLastItem = index === items.length - 1

    const { href } = new URL(getRelativeUrl(baseUrl, itemPath), baseUrl)
    URLS.push(href)

    html += `<li>${prefix}${isLastItem ? '└' : '├'}─`

    if (isDirectory) {
      html += `<span class="directory" onclick="toggleDirectory('${itemId}')" style="cursor: pointer;"><span class="name">${item}/</span></span>`
      html += `<span class="size">${size}</span>`
      html += `<div id="${itemId}" style="display: none;">`
      html += generateTreeView(itemPath, href, `${prefix}│  `, level + 1)
      html += '</div>'
    } else {
      html += `<span class="file"><a class="name" target="_blank" href="${href}">${item}</a></span>`
      html += `<span class="size">${size}</span>`
    }

    html += '</li>'
  })

  html += '</ul>'
  return html
}

const generateHTML = async (directoryPath, baseUrl) => {
  const treeView = generateTreeView(directoryPath, baseUrl)
  const { files, dirs, size } = rootStats(directoryPath)

  const style = `
  :root {
    --gray0: #f8f9fa;
    --gray1: #f1f3f5;
    --gray2: #e9ecef;
    --gray3: #dee2e6;
    --gray4: #ced4da;
    --gray5: #adb5bd;
    --gray6: #868e96;
    --gray7: #495057;
    --gray8: #343a40;
    --gray9: #212529;
    --black: #000;
    --black95: rgba(0, 0, 0, 0.95);
    --black90: rgba(0, 0, 0, 0.9);
    --black80: rgba(0, 0, 0, 0.8);
    --black70: rgba(0, 0, 0, 0.7);
    --black60: rgba(0, 0, 0, 0.6);
    --black50: rgba(0, 0, 0, 0.5);
    --black40: rgba(0, 0, 0, 0.4);
    --black30: rgba(0, 0, 0, 0.3);
    --black20: rgba(0, 0, 0, 0.2);
    --black10: rgba(0, 0, 0, 0.1);
    --black05: rgba(0, 0, 0, 0.05);
    --black025: rgba(0, 0, 0, 0.025);
    --black0125: rgba(0, 0, 0, 0.0125);
    --white: #fff;
    --white95: rgba(255, 255, 255, 0.95);
    --white90: rgba(255, 255, 255, 0.9);
    --white80: rgba(255, 255, 255, 0.8);
    --white70: rgba(255, 255, 255, 0.7);
    --white60: rgba(255, 255, 255, 0.6);
    --white50: rgba(255, 255, 255, 0.5);
    --white40: rgba(255, 255, 255, 0.4);
    --white30: rgba(255, 255, 255, 0.3);
    --white20: rgba(255, 255, 255, 0.2);
    --white10: rgba(255, 255, 255, 0.1);
    --white05: rgba(255, 255, 255, 0.05);
    --white025: rgba(255, 255, 255, 0.025);
    --white0125: rgba(255, 255, 255, 0.0125);
    --dots-color: var(--black30);
  }

  * {
    -webkit-font-smoothing: antialiased;
    box-sizing: border-box;
    text-rendering: optimizeLegibility;
  }

  html,
  body {
    font: 20px/1.5 monospace;
    font-weight: 400;
    line-height: normal;
    margin: 0;
    padding: 0;
    min-height: 100vh;
    width: 100%;
    overflow-x: hidden;
  }

  main {
    max-width: 650px;
    margin: 32px auto 0;
    padding: 2rem;
    position: relative; /* Ensure it's above the background */
    z-index: 1;
  }

  #background {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    min-height: 100vh;
    z-index: -1;
  }

  #background::before {
    content: "";
    position: absolute;
    width: 400%;
    height: 100%;
    z-index: -1;
    background-position:
      0 0,
      25px 25px;
    background-size: 50px 50px;
    background-image: radial-gradient(var(--dots-color) 1px, transparent 0),
      radial-gradient(var(--dots-color) 1px, transparent 0);

    animation: slide 100s linear infinite;
    animation-direction: reverse;
  }

  h1 {
    font-weight: 700;
    line-height: 1.2;
    color: var(--black);
    margin: 0;
  }

  .name {
    margin: 0;
    margin: 0 8px;
  }

  ul {
    padding-left: 0;
    list-style-type: none;
  }

  li {
    margin-top: 4px;
    white-space: nowrap;
  }

  .stats {
    font-family: "Inter", sans-serif;
    margin-top: 8px;
    color: var(--gray6);
  }

  h1,
  .name {
    font-family: "Inter", sans-serif;
    color: var(--black);
  }

  body {
    color: var(--gray6);
    background: var(--white);
  }

  .size {
    font-size: 0.75em;
  }

  a {
    color: rgb(6, 125, 247) !important;
  }

  @keyframes slide {
    from {
      transform: translate3d(0, 0, 0);
    }
    to {
      transform: translate3d(-25%, 0, 0);
    }
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --white: #000;
      --black: #fff;
      --dots-color: var(--gray7);
    }
  }

  @media only screen and (max-width: 768px) {
    html,
    body {
      font-size: 18px;
    }
  }`

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0">
    <title>Microlink CDN</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
    <link rel="shortcut icon" href="https://cdn.microlink.io/logo/favicon.ico" type="image/x-icon">
    <meta property="og:description" content="Content Delivery Network for Microlink assets">
    <meta property="og:image" content="https://cdn.microlink.io/banner/cdn.png">
    <meta property="og:site_name" content="Microlink CDN">
    <meta property="og:type" content="website">
    <style>${style}</style>
  </head>
  <body>
    <div id="background"></div>
    <main>
      <header>
        <div style="display: flex; align-items: center;">
          <img style="margin-right: 8px;" alt="microlink logo" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NCIgaGVpZ2h0PSIzMSI+PHBhdGggZmlsbD0iI2VhNDA3YiIgZD0iTTM4LjQ2Mi4yMDlIMTguNTg3Yy0yLjg3OSAwLTUuMjIxIDIuMjE0LTUuMjIxIDQuOTM1VjcuNjZoMy4zVjUuMTQ0YzAtLjg5NS44NjItMS42MjIgMS45MjEtMS42MjJoMTkuODc1YzEuMDYgMCAxLjkyMS43MjggMS45MjEgMS42MjJWMTcuMjJjMCAuODk0LS44NjIgMS42MjEtMS45MiAxLjYyMUgxOC41ODZjLTEuMDYgMC0xLjkyMi0uNzI3LTEuOTIyLTEuNjIxdi0zLjg1OGgtMy4zdjMuODU4YzAgMi43MiAyLjM0MyA0LjkzNCA1LjIyMiA0LjkzNGgxOS44NzVjMi44NzkgMCA1LjIyLTIuMjE0IDUuMjItNC45MzRWNS4xNDRjMC0yLjcyMi0yLjM0MS00LjkzNS01LjIyLTQuOTM1eiIvPjxwYXRoIGZpbGw9IiM2NTRlYTMiIGQ9Ik0zMC4zMTcgMjUuNzM3VjIzLjIyaC0zLjN2Mi41MTdjMCAuODk1LS44NjIgMS42MjItMS45MjIgMS42MjJINS4yMjFjLTEuMDU5IDAtMS45MjEtLjcyOC0xLjkyMS0xLjYyMlYxMy42NmMwLS44OTQuODYyLTEuNjIxIDEuOTIxLTEuNjIxaDE5Ljg3NGMxLjA2IDAgMS45MjIuNzI3IDEuOTIyIDEuNjIxdjMuODU4aDMuM1YxMy42NmMwLTIuNzItMi4zNDMtNC45MzUtNS4yMjItNC45MzVINS4yMkMyLjM0MyA4LjcyNSAwIDEwLjk0IDAgMTMuNjZ2MTIuMDc3YzAgMi43MjEgMi4zNDMgNC45MzUgNS4yMjEgNC45MzVoMTkuODc0YzIuODggMCA1LjIyMi0yLjIxMyA1LjIyMi00LjkzNXoiLz48L3N2Zz4K" class="Image__StyledImage-kJeZZu kwDEid Microlink___StyledImageComponent-TYqFH khPVbw">
          <h1 style="margin-bottom: 0">Microlink CDN</h1>
        </div>
        <p class="stats">${formatNumber(dirs)} directories, ${formatNumber(
    files
  )} files, ${size}.</p>
      </header>
      ${treeView}
    </main>
    <script>
    function toggleDirectory(id) {
      var element = document.getElementById(id);
      if (element) {
        if (element.style.display === 'none') {
          element.style.display = 'block';
        } else {
          element.style.display = 'none';
        }
      }
    }
  </script>
  </body>
</html>`.trim()

  return prettier.format(html, { parser: 'html' })
}

generateHTML(rootPath, baseUrl)
  .then(html => {
    return Promise.all([
      writeFile('dist/index.html', html),
      writeFile('urls.json', JSON.stringify(URLS, null, 2))
    ])
  })
  .then(() => {
    console.log('dist/index.html generated successfully ✨')
    process.exit()
  })
