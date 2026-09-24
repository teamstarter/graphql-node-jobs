import { ApolloClient } from '@apollo/client/core';
import { JobInput } from '../types';
export default function createJob(client: ApolloClient<any>, job: JobInput): Promise<any>;
