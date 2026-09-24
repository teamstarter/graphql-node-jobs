import { JobType } from '../types';
import { Sequelize } from 'sequelize';
/**
 * @param dbConfig Sequelize database configuration object
 * @param gsgParams Params from graphql-sequelize-generator that overwrite the default ones.
 */
export default function getApolloServer({ dbConfig, sequelizeInstance, gsgParams, customMutations, onJobFail, wsServer }: {
    dbConfig: any;
    sequelizeInstance?: Sequelize;
    gsgParams?: any;
    customMutations?: any;
    onJobFail?: (job: JobType) => Promise<any>;
    wsServer?: any;
}): Promise<import("@apollo/server").ApolloServer<import("@apollo/server").BaseContext>>;
