import { ApolloClient } from '@apollo/client/core';
import { JobType, UpdateProcessingInfo } from '../types';
export default function checkForJobs(args: {
    processingFunction: (job: JobType, facilities: {
        updateProcessingInfo: UpdateProcessingInfo;
    }) => Promise<any>;
    client: ApolloClient<any>;
    typeList: string[];
    workerId?: string;
    workerType?: string;
    workerVersion?: string;
    looping?: boolean;
    loopTime?: number;
    isCancelledOnCancelRequest?: boolean;
    nonBlocking?: boolean;
}): Promise<any>;
