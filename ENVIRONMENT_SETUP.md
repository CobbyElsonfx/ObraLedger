# 🌍 Environment Configuration Setup

## Overview

Obra Ledger now uses environment variables for dynamic configuration instead of hardcoded endpoints. This makes it easy to deploy to different environments (development, staging, production).

## Quick Setup

### 1. Copy Environment File

```bash
cp env.example .env
```

### 2. Configure Your Environment

Edit `.env` file with your specific values:

```env
# Development
VITE_API_BASE_URL=http://localhost:3001

# Production
VITE_API_BASE_URL=https://api.obraledger.com

# Staging
VITE_API_BASE_URL=https://staging-api.obraledger.com
```

## Environment Variables

### API Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_API_BASE_URL` | Base URL for API endpoints | `http://localhost:3001` | `https://api.obraledger.com` |
| `VITE_API_TIMEOUT` | API request timeout (ms) | `10000` | `15000` |

### Sync Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_SYNC_INTERVAL_MINUTES` | Auto-sync interval | `5` | `10` |
| `VITE_MAX_RETRY_ATTEMPTS` | Max sync retry attempts | `3` | `5` |

### App Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_APP_NAME` | Application name | `Obra Ledger` | `My Funeral App` |
| `VITE_APP_VERSION` | App version | `1.0.0` | `2.1.0` |
| `VITE_APP_DESCRIPTION` | App description | `Funeral Management System` | `Custom Description` |

### Feature Flags

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_ENABLE_PUSH_NOTIFICATIONS` | Enable push notifications | `false` | `true` |
| `VITE_ENABLE_ANALYTICS` | Enable analytics | `false` | `true` |
| `VITE_ENABLE_DEBUG_MODE` | Enable debug mode | `true` | `false` |

### PWA Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_PWA_NAME` | PWA name | `Obra Ledger` | `My App` |
| `VITE_PWA_SHORT_NAME` | PWA short name | `Obra Ledger` | `MyApp` |
| `VITE_PWA_THEME_COLOR` | PWA theme color | `#1e40af` | `#000000` |
| `VITE_PWA_BACKGROUND_COLOR` | PWA background color | `#ffffff` | `#f0f0f0` |

## Usage in Code

### Import Configuration

```typescript
import { config } from './lib/config';

// Get API URL
const apiUrl = config.getApiUrl('/api/users');

// Check environment
if (config.isDevelopment()) {
  console.log('Running in development mode');
}

// Access specific config
const baseUrl = config.api.baseUrl;
const syncInterval = config.sync.intervalMinutes;
```

### API Endpoints

```typescript
// Instead of hardcoded URLs:
fetch('http://localhost:3001/api/auth/login')

// Use config:
fetch(config.getApiUrl(config.api.endpoints.auth.login))
```

## Environment-Specific Configs

### Development

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_ENABLE_DEBUG_MODE=true
VITE_SYNC_INTERVAL_MINUTES=1
```

### Staging

```env
VITE_API_BASE_URL=https://staging-api.obraledger.com
VITE_ENABLE_DEBUG_MODE=true
VITE_SYNC_INTERVAL_MINUTES=5
```

### Production

```env
VITE_API_BASE_URL=https://api.obraledger.com
VITE_ENABLE_DEBUG_MODE=false
VITE_SYNC_INTERVAL_MINUTES=10
VITE_ENABLE_ANALYTICS=true
```

## Security Notes

- **Never commit `.env` files** to version control
- **Use different API keys** for different environments
- **Validate environment variables** at startup
- **Use HTTPS** in production environments

## Troubleshooting

### Common Issues

1. **API calls failing**: Check `VITE_API_BASE_URL` is correct
2. **Sync not working**: Verify backend is accessible from frontend
3. **Build errors**: Ensure all required env vars are set

### Validation

The config utility provides fallback values, but you can add validation:

```typescript
// In your main.tsx or App.tsx
if (!config.api.baseUrl) {
  throw new Error('VITE_API_BASE_URL is required');
}
```

## Migration from Hardcoded URLs

### Before (Hardcoded)

```typescript
const API_BASE = 'http://localhost:3001';
const LOGIN_URL = `${API_BASE}/api/auth/login`;
```

### After (Environment-based)

```typescript
import { config } from './lib/config';
const LOGIN_URL = config.getApiUrl(config.api.endpoints.auth.login);
```

This approach makes your app deployment-ready and environment-agnostic! 🚀
