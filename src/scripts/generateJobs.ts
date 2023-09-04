import { addDays, addHours } from 'date-fns'

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

export async function generateJobs(
  models: any,
  nbDays: number,
  nbJobsPerDay: number
) {
  const status = [
    'successful',
    'failed',
    'successful',
    'successful',
    'cancelled',
    'queued',
    'successful',
  ]

  let fakeJobs = []
  let jobID = 0

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 370)

  await models.job.destroy({ where: {}, force: true })
  for (let i = 0; i < nbDays; i++) {
    const currentDate = setUpDate(startDate, i)

    for (let i = 0; i < nbJobsPerDay; i++) {
      const randomStatus = status[getRandomInt(0, 6)]

      fakeJobs.push({
        id: jobID,
        type: 'fakeJob',
        status: randomStatus,
        createdAt: currentDate,
        updatedAt: currentDate,
        startedAt: currentDate,
        endedAt:
          randomStatus === 'failed' || randomStatus === 'successful'
            ? addHours(currentDate, 1)
            : currentDate,
        workerId: '0ab7285e-29e1-474c-889a-22891f92ab44',
        isUpdateAlreadyCalledWhileCancelRequested: false,
        isHighFrequency: false,
        isRecoverable: false,
      })
      jobID++
    }
  }

  await models.sequelize.queryInterface.bulkInsert('job', fakeJobs)
}
