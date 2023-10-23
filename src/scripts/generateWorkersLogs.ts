import { getRandomInt } from './generateJobs'
import { addHours, subHours, setMinutes, setSeconds } from 'date-fns' // import date-fns pour manipuler facilement les dates

const workerTypes: string[] = [
  'api-heavy-worker',
  'statistics-heavy-worker',
  'cron-heavy-worker',
  'cpu-heavy-worker',
  'puppeteer-worker',
]

const workerStatus: string[] = ['AVAILABLE', 'PROCESSING', 'FAILED', 'EXITED']

const workerId: string[] = [
  '6fd6ad6b-bd61-4e69-87cc-b6c77cd710a5',
  'c4f3d11c-7294-4a51-9181-5366f61755bb',
  '1b70d1d1-82eb-4ea1-ac4d-bb6be63c4e9e',
  'd59dd969-2747-4eee-806b-14a9118bc60b',
  '2c8af43f-4d80-42e4-9e33-aa67dbef1caf',
]

let fakeJobs: any[] = []

export async function generateWorkersLogs(models: any, nbHours: number) {
  await models.workerMonitoring.destroy({ where: {}, force: true })

  const now = new Date()
  const startDateTime = subHours(now, nbHours)

  for (let hour = 0; hour < nbHours; hour++) {
    const currentHourDateTime = addHours(startDateTime, hour)

    for (let minute = 0; minute < 60; minute++) {
      const currentMinuteDateTime = setMinutes(currentHourDateTime, minute)
      const finalDateTime = setSeconds(currentMinuteDateTime, 0)

      workerTypes.map((workerType, index) => {
        fakeJobs.push({
          workerId: workerId[index],
          workerType: workerType,
          workerStatus: workerStatus[getRandomInt(0, 3)],
          createdAt: finalDateTime,
          updatedAt: finalDateTime,
        })
      })
    }
  }

  await models.sequelize.queryInterface.bulkInsert('workerMonitoring', fakeJobs)
}
