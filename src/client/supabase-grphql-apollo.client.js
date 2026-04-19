import { ApolloClient, HttpLink, InMemoryCache, defaultDataIdFromObject } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import supabase from "./supabase";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;


const httpLink = new HttpLink({
  uri: `${SUPABASE_URL}/graphql/v1`, // The GraphQL endpoint
});

const authLink = setContext(async (_, { headers }) => {
  // runs before every request

  const token = (await supabase.auth.getSession()).data.session?.access_token;

  return {
    headers: {
      ...headers,
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
      // Postman works because it includes these by default or you added them
      'Content-Profile': 'vision-expert',
      'Accept-Profile': 'vision-expert',
    }
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