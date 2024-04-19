const { checkForJobs, getNewClient } = require('./../lib/index')

const client = getNewClient('http://localhost:8080/graphql')

checkForJobs({
  client,
  typeList: ['a', 'b'],
  uri: `http://localhost:${process.env.PORT || 8080}`,
  processingFunction: async (job) => {
    const result = await new Promise((resolve, reject) =>
      setTimeout(() => {
        resolve('plop', job)
      }, 2000)
    )
    return { total: result }
  },
  nonBlocking: true,
  looping: true,
})
