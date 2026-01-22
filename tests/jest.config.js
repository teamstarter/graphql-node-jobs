/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^axios$': 'axios/dist/node/axios.cjs'
  },
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
            decorators: true
          },
          transform: {
            react: {
              runtime: 'automatic'
            }
          }
        },
        module: {
          type: 'commonjs'
        },
        sourceMaps: true
      }
    ]
  },
  transformIgnorePatterns: ['/node_modules/(?!scimmy)']
}
