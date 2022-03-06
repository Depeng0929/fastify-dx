
// This file is meant to eliminate the need to
// have two calls to vite build in package.json:
//
// "build:client": "vite build --ssrManifest --outDir dist/client",
// "build:server": "vite build --ssr entry/server.js --outDir dist/server",

const { move } = require('fs-extra')
const { build: viteBuild, mergeConfig } = require('vite')
const { join } = require('path')

async function build () {
  const outDir = this.options.vite.build.outDir || 'dist'
  const client = mergeConfig(this.options.vite, {
    build: {
      outDir: `${outDir}/client`,
      ssrManifest: true,
    },
  })
  const serverOutDir = `${outDir}/server`
  const server = mergeConfig(this.options.vite, {
    build: {
      ssr: true,
      outDir: serverOutDir,
      rollupOptions: {
        input: join(this.options.root, this.options.entry.server),
      },
    },
  })
  await Promise.all([viteBuild(client), viteBuild(server)])
  await move(join(serverOutDir, 'server.js'), join(serverOutDir, 'server.cjs'))
  console.log(`ℹ created builds at ${outDir}/client and ${outDir}/server.`)
}

module.exports = build
