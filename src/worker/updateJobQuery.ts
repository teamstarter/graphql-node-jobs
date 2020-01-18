import gql from 'graphql-tag'

const updateJobQuery = gql`
  mutation jobUpdate($job: jobInput!) {
    job: jobUpdate(job: $job) {
      id
      type
      name
      input
      output
      status
      processingInfo
    }
  }
`

export default updateJobQuery
