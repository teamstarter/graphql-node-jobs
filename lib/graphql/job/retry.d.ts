import { InAndOutTypes, SequelizeModels } from '@teamstarter/graphql-sequelize-generator/src/types/types';
import { GraphQLFieldConfig } from 'graphql';
import { PubSub } from 'graphql-subscriptions';
export default function RetryJob(graphqlTypes: InAndOutTypes, models: SequelizeModels, pubSubInstance?: PubSub | null): GraphQLFieldConfig<any, any, any>;
