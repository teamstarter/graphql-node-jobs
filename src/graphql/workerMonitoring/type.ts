import {
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLString,
} from 'graphql'

export const workerInfoInputType = new GraphQLInputObjectType({
  name: 'workerInfoInput',
  fields: {
    workerId: { type: GraphQLString },
    workerType: { type: GraphQLString },
    workerStatus: { type: GraphQLString },
  },
})

export const workerInfoOutputType = new GraphQLObjectType({
  name: 'workerInfoOutput',
  fields: {
    workerId: { type: GraphQLString },
    workerType: { type: GraphQLString },
    workerStatus: { type: GraphQLString },
  },
})

export const successType = new GraphQLObjectType({
  name: 'success',
  fields: {
    success: { type: GraphQLBoolean },
  },
})
