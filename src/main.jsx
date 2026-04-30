import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { StrictMode } from 'react';
import { ApolloProvider } from "@apollo/client/react";

import App from './routes/App.jsx';
import './main.css';
import apolloSupabaseGraphqlClient from './client/supabase-grphql-apollo.client.js';
import { AuthProvider } from './auth/AuthProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={apolloSupabaseGraphqlClient}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  </StrictMode>
);
