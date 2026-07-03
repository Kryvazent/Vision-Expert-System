import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { StrictMode } from 'react';
import { ApolloProvider } from "@apollo/client/react";
import { ConfigProvider } from 'antd';

import App from './routes/App.jsx';
import './main.css';
import apolloSupabaseGraphqlClient from './client/supabase-grphql-apollo.client.js';
import { AuthProvider } from './auth/AuthProvider.jsx';

/**
 * Ant Design theme tokens — kept in sync with CSS custom properties in
 * main.css so both styling layers (Tailwind classes & Ant components) share
 * the same visual language.
 */
const antdTheme = {
  token: {
    // Brand
    colorPrimary:       '#1677ff',
    colorSuccess:       '#52c41a',
    colorWarning:       '#faad14',
    colorError:         '#ff4d4f',
    colorInfo:          '#1677ff',

    // Typography
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    colorText:          '#1f1f1f',
    colorTextSecondary: '#595959',
    colorTextTertiary:  '#8c8c8c',
    colorTextDisabled:  '#bfbfbf',

    // Background
    colorBgContainer:   '#ffffff',
    colorBgLayout:      '#f0f2f5',
    colorBgElevated:    '#ffffff',

    // Border
    colorBorder:        '#e8e8e8',
    colorBorderSecondary: '#f0f0f0',
    borderRadius:       8,
    borderRadiusLG:     12,
    borderRadiusSM:     6,

    // Control heights
    controlHeight:      36,
    controlHeightSM:    28,
    controlHeightLG:    44,

    // Spacing
    padding:            16,
    paddingLG:          24,
    paddingSM:          12,
    paddingXS:          8,

    // Shadows
    boxShadow:         '0 2px 12px rgba(0,0,0,0.08)',
    boxShadowSecondary:'0 1px 4px rgba(0,0,0,0.06)',
  },
  components: {
    Card: {
      borderRadiusLG: 16,
    },
    Table: {
      borderRadius: 12,
      headerBg: '#f0f4f8',
      headerColor: '#1f1f1f',
      headerSortActiveBg: '#e8eef8',
      rowHoverBg: '#f5f8ff',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(255,255,255,0.18)',
      darkItemHoverBg: 'rgba(255,255,255,0.10)',
      darkItemColor: 'rgba(255,255,255,0.75)',
      darkItemSelectedColor: '#ffffff',
      itemBorderRadius: 8,
    },
    Button: {
      borderRadius: 8,
      fontWeight: 500,
    },
    Input: {
      borderRadius: 8,
    },
    Select: {
      borderRadius: 8,
    },
    DatePicker: {
      borderRadius: 8,
    },
    Modal: {
      borderRadiusLG: 16,
    },
    Tag: {
      borderRadiusSM: 20,
      fontSizeSM: 12,
    },
  },
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={apolloSupabaseGraphqlClient}>
      <ConfigProvider theme={antdTheme}>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </ConfigProvider>
    </ApolloProvider>
  </StrictMode>
);
