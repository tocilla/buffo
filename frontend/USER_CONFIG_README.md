# User Configuration System

## Overview

The application now supports multiple users with personalized branding and configuration. Each user has their own configuration file that determines the appearance and behavior of the dashboard.

## Supported Users

Currently, the system supports two users:
- `mariete` - Uses `mariete-config.json`
- `faal` - Uses `faal-config.json`

## Authentication

Users authenticate using HTTP Basic Authentication with their username and password:
- Username: `mariete` or `faal`
- Password: Set via environment variables `MARIETE_PASSWORD` and `FAAL_PASSWORD` (defaults to "password")

## Configuration Files

Each user has a JSON configuration file in the frontend public directory (`frontend/public/`):

### mariete-config.json
```json
{
  "user": "mariete",
  "branding": {
    "name": "Mariete AI",
    "description": "The AI Assistant that acts on your behalf.",
    "logo": "/buffo-symbol.svg",
    "favicon": "/favicon.ico",
    "primaryColor": "#3b82f6",
    "accentColor": "#1d4ed8"
  },
  "app": {
    "title": "Mariete AI Dashboard",
    "welcomeMessage": "What would you like Mariete AI to do today?",
    "placeholderText": "Ask Mariete AI to...",
    "cta": "Start with Mariete",
    "url": "http://157.180.8.150:3000"
  },
  "contact": {
    "email": "support@mariete.ai",
    "twitter": "https://x.com/marieteai",
    "discord": "https://discord.gg/marieteai",
    "github": "https://github.com/mariete-ai/mariete"
  }
}
```

### faal-config.json
```json
{
  "user": "faal",
  "branding": {
    "name": "Faal AI",
    "description": "The Generalist AI Agent that can act on your behalf.",
    "logo": "/buffo-symbol.svg",
    "favicon": "/favicon.ico",
    "primaryColor": "#10b981",
    "accentColor": "#059669"
  },
  "app": {
    "title": "Faal AI Dashboard",
    "welcomeMessage": "What would you like Faal AI to do today?",
    "placeholderText": "Ask Faal AI to...",
    "cta": "Start with Faal",
    "url": "http://157.180.8.150:3000"
  },
  "contact": {
    "email": "support@faal.ai",
    "twitter": "https://x.com/faalai",
    "discord": "https://discord.gg/faalai",
    "github": "https://github.com/faal-ai/faal"
  }
}
```

## Environment Variables

Set the following environment variables in your `.env.local` file:

```bash
# User passwords (defaults to "password" if not set)
MARIETE_PASSWORD=your_secure_password_here
FAAL_PASSWORD=your_secure_password_here
```

## How It Works

1. **Authentication**: The middleware checks HTTP Basic Auth credentials against the configured users
2. **Cookie Storage**: Upon successful authentication, the username is stored in a secure HTTP-only cookie
3. **Configuration Loading**: The frontend loads the appropriate configuration file based on the authenticated user
4. **Dynamic Branding**: The dashboard displays the brand name, welcome message, and other customizations from the user's config

## Customizable Elements

The following elements change based on user configuration:
- **Sidebar Logo**: Uses `branding.logo` and `branding.name`
- **Brand Name**: Displayed in sidebar when expanded
- **Dashboard Title**: Browser tab title from `app.title`
- **Welcome Message**: Main dashboard greeting from `app.welcomeMessage`
- **Input Placeholder**: Chat input placeholder from `app.placeholderText`
- **Colors**: Primary and accent colors for theming (future enhancement)

## Adding New Users

To add a new user:

1. Create a new configuration file: `{username}-config.json`
2. Add the user to the `validUsers` object in `middleware.ts`
3. Set the password environment variable: `{USERNAME}_PASSWORD`
4. Restart the application

## Technical Implementation

- **Middleware**: `frontend/src/middleware.ts` - Handles authentication and cookie setting
- **Context**: `frontend/src/contexts/UserConfigContext.tsx` - Manages configuration state
- **API Route**: `frontend/src/app/api/user-config/route.ts` - Provides user info to frontend
- **Components**: Various components use `useUserConfig()` hook to access configuration