import { SequelizeModels } from '@teamstarter/graphql-sequelize-generator/src/types/types'

export default async function updatePipelineStatus(
  pipelineId: number,
  models: SequelizeModels
) {
  const steps = await models.pipelineStep.findAll({
    where: {
      pipelineId,
    },
  })

  const stepsStatus = steps.map((step) => step.status)
  const allStepsAreDone = stepsStatus.every(
    (status: string) => status === 'done'
  )

  if (!allStepsAreDone) {
    return
  }

  let status = 'successful'
  for (const step of steps) {
    if (step.jobId) {
      const job = await models.job.findByPk(step.jobId)
      if (job.status !== 'successful') {
        status = 'failed'
      }
    } else {
      const batch = await models.batch.findByPk(step.batchId)
      if (batch.status !== 'successful') {
        status = 'failed'
      }
    }
  }

  const pipeline = await models.pipeline.findByPk(pipelineId)
  await pipeline.update({ status })
}
