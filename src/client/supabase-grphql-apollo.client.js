import { ApolloClient, HttpLink, InMemoryCache, defaultDataIdFromObject } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import supabase from "./supabase";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;


const httpLink = new HttpLink({
  uri: `${SUPABASE_URL}/graphql/v1`, // The GraphQL endpoint
});

let accessToken = null;

supabase.auth.getSession().then(({ data: { session } }) => {
  accessToken = session?.access_token ?? null;
});

supabase.auth.onAuthStateChange((_event, session) => {
  accessToken = session?.access_token ?? null;
});

const authLink = setContext((_, { headers }) => {

  console.log("ACCESS TOKEN USED:", accessToken);
  
  return {
    headers: {
      ...headers,
      apikey: SUPABASE_ANON_KEY,
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };
});

const cache = new InMemoryCache({
  dataIdFromObject(responseObject) {
    if ('nodeId' in responseObject) {
      return `${responseObject.nodeId}`;
    }

    return defaultDataIdFromObject(responseObject);
  }
});

const apolloSupabaseGraphqlClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache
});

export default apolloSupabaseGraphqlClient;