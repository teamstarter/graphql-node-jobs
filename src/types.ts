export type OutputTypes = any

export type SequelizeModel = any

export type SequelizeModels = {
  [key: string]: SequelizeModel
}

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

export type ModelEndpointsConfiguration = {
  model: SequelizeModel
  actions?: ActionList
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
