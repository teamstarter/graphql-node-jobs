import { SequelizeModels } from '@teamstarter/graphql-sequelize-generator/src/types/types'

export default async function putNextStepJobsInTheQueued(
  nextStep: any,
  models: SequelizeModels
) {
  if (nextStep.jobId) {
    const job = await models.job.findOne({
      where: { id: nextStep.jobId },
    })
    await job.update({ status: 'queued' })
  }
  if (nextStep.batchId) {
    const jobs = await models.job.findAll({
      where: { batchId: nextStep.batchId },
    })
    for(const job of jobs) {
      await job.update({ status: 'queued' })
    }
  }
}
