import { Sequelize } from 'sequelize';
export declare function getModelsAndInitializeDatabase({ dbConfig, sequelizeInstance, dbhash, }: {
    dbConfig?: any;
    sequelizeInstance?: Sequelize;
    dbhash?: string;
}): Promise<any>;
export declare function getModels(dbConfig: any, sequelizeInstance?: Sequelize): any;
