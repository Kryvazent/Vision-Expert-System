import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY; 

const httpLink = new HttpLink({
  uri: `${SUPABASE_URL}/graphql/v1`, // The GraphQL endpoint
});

const authLink = new SetContextLink((_, { headers }) => {
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      apiKey: SUPABASE_ANON_KEY,
    }
  };
});

const apolloSupabaseGraphqlClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default apolloSupabaseGraphqlClient;