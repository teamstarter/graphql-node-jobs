module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: 'server',
      // The script already watch by itself
      watch: false,
      script: 'ts-node-dev',
      args: `-O '{"module": "commonjs"}' --respawn --transpileOnly ./server/index.ts`,
      // Be careful, --inspect takes a lot of resources and is greatly reducing the dev experience when enabled.
      // node_args: ['--inspect'],
      log_date_format: 'YYYY-MM-DD HH:mm Z'
    }
  ],
  deploy: {}
}
