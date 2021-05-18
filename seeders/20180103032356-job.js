const timestamp = (entry) =>
  Object.assign(entry, {
    createdAt: entry.createdAt || new Date('2007-07-12 00:04:22'),
    updatedAt: new Date('2007-07-12 00:04:22'),
    deletedAt: entry.deletedAt || null, // If we want a seeders to have a deletedAt value, do not override it
  })

module.exports = {
  up: function (queryInterface) {
    return queryInterface.bulkInsert(
      'job',
      [
        {
          id: 1,
          type: 'a',
          name: 'Bla a',
          status: 'queued',
          isHighFrequency: true,
          isRecoverable: false,
          input: '{}',
          output: '{}',
          batchId: null,
        },
        {
          id: 2,
          type: 'b',
          name: 'Bla b',
          status: 'queued',
          isHighFrequency: false,
          isRecoverable: true,
          input: '{}',
          output: '{}',
          batchId: null,
        },
      ].map(timestamp),
      {}
    )
  },

  down: function (queryInterface) {
    return queryInterface.bulkDelete('job', null, {})
  },
}
