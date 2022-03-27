const viteVue = require('@vitejs/plugin-vue')
const viteVueJsx = require('@vitejs/plugin-vue-jsx')
const viteBlueprint = require('vite-plugin-blueprint')

const dev = process.env.NODE_ENV !== 'production'

/**
 * @type {import('vite').UserConfig}
 */
module.exports = {
  logLevel: dev ? 'error' : 'info',
  plugins: [
    viteVue(),
    viteVueJsx(),
    viteBlueprint({
      prefix: '@app/',
      root: resolve => resolve(__dirname, 'base'),
      files: [
        ['entry/client.js', [
          'entry-client.js',
          'client/entry.js',
          'client-entry.js',
        ]],
        ['entry/server.js', [
          'entry-server.js',
          'server/entry.js',
          'server-entry.js',
        ]],
        ['client.js'],
        ['client.vue'],
        ['head.js'],
        ['error.vue'],
        ['router.vue'],
        ['routes.js'],
        ['index.css'],
      ],
    }),
  ],
  // Base build settings, default values
  // for assetsDir and outDir match Vite's defaults
  build: {
    assetsDir: 'assets',
    outDir: 'dist',
    minify: !dev,
  },
  ssr: {
    external: [
      'fastify-vite-vue/routing',
      'fastify-vite-vue/app',
      'fastify-vite-vue/server',
    ],
  },
}
