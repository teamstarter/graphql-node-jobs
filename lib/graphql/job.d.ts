import { InAndOutTypes, ModelDeclarationType, SequelizeModels } from '@teamstarter/graphql-sequelize-generator/src/types/types';
import { PubSub } from 'graphql-subscriptions';
import { JobType } from '../types';
export declare class CancelRequestedError extends Error {
    constructor(message: string);
}
export default function JobConfiguration(graphqlTypes: InAndOutTypes, models: SequelizeModels, pubSubInstance?: PubSub | null, onJobFail?: (job: JobType) => Promise<any>): ModelDeclarationType<any>;
