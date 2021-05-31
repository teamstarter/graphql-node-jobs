const timestamp = (entry) =>
  Object.assign(entry, {
    createdAt: entry.createdAt || new Date('2007-07-12 00:04:22'),
    updatedAt: new Date('2007-07-12 00:04:22'),
    deletedAt: entry.deletedAt || null, // If we want a seeders to have a deletedAt value, do not override it
  })

module.exports = {
  up: function (queryInterface) {
    return queryInterface.bulkInsert(
      'pipelineStep',
      [
        {
          id: 1,
          jobId: 4,
          pipelineId: 2,
          index: 1,
          status: 'planned',
        },
        {
          id: 2,
          jobId: 5,
          pipelineId: 2,
          index: 2,
          status: 'planned',
        },
      ].map(timestamp),
      {}
    )
  },

  down: function (queryInterface) {
    return queryInterface.bulkDelete('pipelineStep', null, {})
  },
}
