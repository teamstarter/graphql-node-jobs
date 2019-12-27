const request = require('supertest')
const {
  migrateDatabase,
  seedDatabase,
  getNewServer,
  models,
  closeEverything
} = require('./test-database.js')

let server = null

/**
 * Starting the tests
 */
describe('Test the job endpoint', () => {
  beforeAll(async () => {
    await migrateDatabase()
    await seedDatabase()
    server = await getNewServer()
  })

  afterAll(async done => {
    await closeEverything(server, models, done)
  })

  it('QUERY: jobs', async () => {
    const response = await request(server).get(
      `/graphql?query=query getJobs {
          job(order:"id") {
            id
            name    
          }
        }
        &operationName=getJobs`
    )

    expect(response.body).toMatchSnapshot()
  })
})
