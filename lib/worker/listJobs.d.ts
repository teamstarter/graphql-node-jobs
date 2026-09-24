import { ApolloClient } from '@apollo/client/core';
import { JSONValue } from '../types';
export default function listJobs(client: ApolloClient<any>, { where, order, limit, offset, }?: {
    where?: JSONValue;
    order?: string;
    limit?: number;
    offset?: number;
}): Promise<any>;
