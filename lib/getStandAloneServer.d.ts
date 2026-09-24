import { Sequelize } from 'sequelize';
import { JobType } from './types';
export default function getStandAloneServer(dbConfig: any, gsgParams?: any, customMutations?: any, onJobFail?: (job: JobType) => Promise<any>, sequelizeInstance?: Sequelize): Promise<any>;
