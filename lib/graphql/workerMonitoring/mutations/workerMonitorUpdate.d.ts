import { SequelizeModels } from '@teamstarter/graphql-sequelize-generator/src/types/types';
import { GraphQLFieldConfig } from 'graphql';
import { PubSub } from 'graphql-subscriptions';
export declare function workerMonitorUpdate(pubSubInstance: PubSub, models: SequelizeModels): GraphQLFieldConfig<any, any, any>;
