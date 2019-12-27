const timestamp = entry =>
  Object.assign(entry, {
    createdAt: entry.createdAt || new Date('2007-07-12 00:04:22'),
    updatedAt: new Date('2007-07-12 00:04:22'),
    deletedAt: entry.deletedAt || null // If we want a seeders to have a deletedAt value, do not override it
  })

module.exports = {
  up: function(queryInterface) {
    return queryInterface.bulkInsert(
      'batch',
      [
        {
          id: 1,
          status: 'planned',
          pipelineId: 1
        },
        {
          id: 2,
          status: 'processing',
          pipelineId: 2
        }
      ].map(timestamp),
      {}
    )
  },

  down: function(queryInterface) {
    return queryInterface.bulkDelete('build', null, {})
  }
}
