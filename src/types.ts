import { GraphQLScalarType, GraphQLNonNull } from 'graphql'
import { Model, Sequelize, BuildOptions } from 'sequelize/types'

export type JSONPrimitive = string | number | boolean | null
export type JSONValue = JSONPrimitive | JSONObject | JSONArray
export type JSONObject = { [member: string]: JSONValue }
export type JSONArray = JSONValue[]

export type JobStatus =
  | 'planned'
  | 'queued'
  | 'processing'
  | 'failed'
  | 'sucessful'
  | 'cancelled'
export type Job = {
  id: number
  type: string
  name: string
  input: string
  output: string
  status: JobStatus
  batchId: number
}

export type OutputType = any

export type OutputTypes = {
  [key: string]: OutputType
}

export type InputTypes = any

export type InAndOutGraphqlTypes = {
  outputTypes: OutputTypes
  inputTypes: InputTypes
}

export type SequelizeModel = typeof Model & {
  new (values?: object, options?: BuildOptions): any
}

export type SequelizeConfig = any

export type SequelizeModels = {
  [key: string]: SequelizeModel
} & { sequelize: Sequelize }

export type Action = 'list' | 'create' | 'delete' | 'update' | 'count'

export type ActionList = Array<Action>

export type FindOptions = any

export type Args = any

export type Context = any

export type Info = any

export type EntityProperties = any

export type Where = any

export type ListBeforeHook = (
  findOptions: FindOptions,
  args: Args,
  context: Context,
  info: Info
) => FindOptions
export type MutationBeforeHook = (
  findOptions: FindOptions,
  args: Args,
  context: Context,
  info: Info
) => EntityProperties
export type CreateAfterHook = (
  newEntity: any,
  source: any,
  args: Args,
  context: Context,
  info: Info
) => any
export type UpdateAfterHook = (
  newEntity: any,
  entitySnapshotBeforeUpdate: any,
  source: any,
  args: Args,
  context: Context,
  info: Info
) => any
export type DeleteBeforeHook = (
  where: Where,
  findOptions: FindOptions,
  args: Args,
  context: Context,
  info: Info
) => Where
export type DeleteAfterHook = (
  oldEntitySnapshot: any,
  source: any,
  args: Args,
  context: Context,
  info: Info
) => any

export type MutationList = {
  [key: string]: CustomMutationConfiguration
}

export type EnpointArg = {
  type: GraphQLScalarType | GraphQLNonNull<any>
}

export type EndpointArgs = {
  [key: string]: EnpointArg
}

export type CustomResolver = (
  source: any,
  args: Args,
  context: Context
) => Promise<any>

export type CustomMutationConfiguration = {
  type: OutputType
  description?: string
  args: EndpointArgs
  resolve: CustomResolver
}

export type ModelEndpointsConfiguration = {
  model: SequelizeModel
  actions?: ActionList
  additionalMutations?: MutationList
  list?: {
    before?: ListBeforeHook
  }
  create?: {
    before?: MutationBeforeHook
    after?: CreateAfterHook
  }
  update?: {
    before?: MutationBeforeHook
    after?: UpdateAfterHook
  }
  delete?: {
    before?: DeleteBeforeHook
    after?: DeleteAfterHook
  }
}
