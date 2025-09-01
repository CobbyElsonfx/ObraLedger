// Configuration utility for environment variables
export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
    endpoints: {
      auth: {
        login: '/api/auth/login',
        register: '/api/auth/register',
        profile: '/api/auth/profile',
      },
      sync: {
        sync: '/api/sync/sync',
        resolveConflict: '/api/sync/resolve-conflict',
        status: '/api/sync/status',
      },
      deceased: '/api/deceased',
      contributors: '/api/contributors',
      contributions: '/api/contributions',
      expenses: '/api/expenses',
      arrears: '/api/arrears',
      settings: '/api/settings',
    }
  },

  // Sync Configuration
  sync: {
    intervalMinutes: parseInt(import.meta.env.VITE_SYNC_INTERVAL_MINUTES || '5'),
    maxRetryAttempts: parseInt(import.meta.env.VITE_MAX_RETRY_ATTEMPTS || '3'),
  },

  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Obra Ledger',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    description: import.meta.env.VITE_APP_DESCRIPTION || 'Funeral Management System',
  },

  // Feature Flags
  features: {
    pushNotifications: import.meta.env.VITE_ENABLE_PUSH_NOTIFICATIONS === 'true',
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    debugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
  },

  // PWA Configuration
  pwa: {
    name: import.meta.env.VITE_PWA_NAME || 'Obra Ledger',
    shortName: import.meta.env.VITE_PWA_SHORT_NAME || 'Obra Ledger',
    themeColor: import.meta.env.VITE_PWA_THEME_COLOR || '#1e40af',
    backgroundColor: import.meta.env.VITE_PWA_BACKGROUND_COLOR || '#ffffff',
  },

  // Helper methods
  getApiUrl: (endpoint: string) => {
    return `${config.api.baseUrl}${endpoint}`;
  },

  isDevelopment: () => {
    return import.meta.env.DEV;
  },

  isProduction: () => {
    return import.meta.env.PROD;
  },
};

// Type-safe configuration access
export type Config = typeof config;
export default config;
