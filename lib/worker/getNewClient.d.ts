import { ApolloClient, ApolloClientOptions } from '@apollo/client/core';
type Partial<T> = {
    [P in keyof T]?: T[P];
};
export default function getNewClient(uri: string, wsUri?: string, apolloClientOptions?: Partial<ApolloClientOptions<any>>): ApolloClient<any>;
export {};
