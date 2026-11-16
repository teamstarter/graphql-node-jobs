import { JobType } from '../types';
import { Sequelize } from 'sequelize';
/**
 * @param dbConfig Sequelize database configuration object
 * @param gsgParams Params from graphql-sequelize-generator that overwrite the default ones.
 * @param cancelProcessingJobsOnBoot Cancel the jobs still `processing` when the
 * server boots (default). Set it to false when the workers do not run in the
 * process of the server, see cancelProcessingJobs.
 */
export default function getApolloServer({ dbConfig, sequelizeInstance, gsgParams, customMutations, onJobFail, wsServer, cancelProcessingJobsOnBoot, }: {
    dbConfig: any;
    sequelizeInstance?: Sequelize;
    gsgParams?: any;
    customMutations?: any;
    onJobFail?: (job: JobType) => Promise<any>;
    wsServer?: any;
    cancelProcessingJobsOnBoot?: boolean;
}): Promise<import("@apollo/server").ApolloServer<import("@apollo/server").BaseContext>>;
