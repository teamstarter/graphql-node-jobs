const { checkForJobs } = require('./../lib/index')

checkForJobs({
  typeList: ['a', 'b'],
  uri: `http://localhost:${process.env.PORT || 8080}`,
  processingFunction: async job => {
    const result = await new Promise((resolve, reject) =>
      setTimeout(() => {
        resolve('plop')
      }, 100)
    )
    return { total: result }
  },
  looping: false
})
