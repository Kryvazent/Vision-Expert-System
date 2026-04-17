import { ApolloClient, HttpLink, InMemoryCache, defaultDataIdFromObject } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import supabase from "./supabase";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY; 


const httpLink = new HttpLink({
  uri: `${SUPABASE_URL}/graphql/v1`, // The GraphQL endpoint
});

const authLink = new SetContextLink(async (_, { headers }) => {
  // runs before every request
  
  const token = (await supabase.auth.getSession()).data.session?.access_token;

  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
      apikey: SUPABASE_ANON_KEY,
    }
  };
});

const cache = new InMemoryCache({
    dataIdFromObject(responseObject){
      if('nodeId' in responseObject){
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