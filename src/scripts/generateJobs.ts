import Job from '../models/job'
import { addDays } from 'date-fns'

// FUNCTIONS
function getRandomInt(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function setUpDate(startDate: Date, i: number) {
  const currentDate = addDays(startDate, i)

  currentDate.setUTCHours(1)
  currentDate.setUTCMinutes(0)
  currentDate.setUTCSeconds(0)
  return currentDate
}

export async function generateJobs(models: any) {
  const status = ['success', 'failed', 'cancelled', 'queued']

  let fakeJobs = []
  let jobID = 0

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 370)

  await models.job.truncate()
  // 371 days
  for (let i = 0; i < 10; i++) {
    const currentDate = setUpDate(startDate, i)
    // 10000 jobs
    const numberOfJobs = getRandomInt(0, 10)

    for (let i = 0; i < numberOfJobs; i++) {
      const randomStatus = status[getRandomInt(0, 3)]

      fakeJobs.push({
        id: jobID,
        type: 'fakeJob',
        status: randomStatus,
        createdAt: currentDate,
        updatedAt: currentDate,
        startedAt: currentDate,
        endedAt:
          randomStatus === 'failed' || randomStatus === 'successful'
            ? currentDate.setUTCHours(2)
            : currentDate,
        workerId: '0ab7285e-29e1-474c-889a-22891f92ab44',
        isUpdateAlreadyCalledWhileCancelRequested: false,
        isHighFrequency: false,
        isRecoverable: false,
      })
    }
  }

  await models.sequelize.queryInterface.bulkInsert('job', fakeJobs)
}
