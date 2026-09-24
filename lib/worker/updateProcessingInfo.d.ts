import { ApolloClient } from '@apollo/client/core';
import { JobType, ProcessingInfo } from './../types';
export default function updateProcessingInfo(client: ApolloClient<any>, job: JobType, processingInfo: ProcessingInfo, isCancelledOnCancelRequest?: boolean): Promise<import("@apollo/client/core").InteropMutateResult<any>>;
