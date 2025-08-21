# Epic Games Account Linking Setup

## Required Environment Variables

Add these variables to your `.env.local` file:

```env
# Epic Games OAuth Configuration
EPIC_CLIENT_ID=your_epic_games_client_id
EPIC_CLIENT_SECRET=your_epic_games_client_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Supabase Service Role Key (required for bypassing RLS in OAuth callback)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Epic Games Developer Setup

1. **Create Epic Games Developer Account**
   - Go to [Epic Games Developer Portal](https://dev.epicgames.com/)
   - Sign in with your Epic Games account
   - Create a new application

2. **Configure OAuth Application**
   - In your Epic Games application settings:
   - **Redirect URIs**: Add `http://localhost:3000/api/auth/epic/callback`
   - **Scopes**: Enable `basic_profile` scope
   - **Client Type**: Web Application

3. **Get Credentials**
   - Copy your `Client ID` and `Client Secret`
   - Add them to your `.env.local` file

## Database Setup

Run the SQL migration to create the linked accounts table:

```sql
-- Run this in your Supabase SQL editor
-- File: database/create_linked_accounts_table.sql
```

## Features Implemented

### Epic Games OAuth Flow
- **Authentication**: Users can link their Epic Games account via OAuth 2.0
- **Data Retrieved**: Username, email address, display name, and country
- **Secure Storage**: Tokens stored securely in database with expiration tracking

### Profile Integration
- **Linked Accounts Tab**: Shows all connected external accounts
- **Real-time Updates**: Accounts list updates immediately after linking/unlinking
- **Error Handling**: Comprehensive error messages for failed operations

### API Endpoints
- `GET /api/auth/epic?action=login` - Initiates Epic Games OAuth flow
- `GET /api/auth/epic/callback` - Handles OAuth callback and token exchange
- `GET /api/linked-accounts` - Fetches user's linked accounts
- `DELETE /api/linked-accounts` - Unlinks specific provider account

## Usage

1. Navigate to "My Account" page
2. Click on "Linked Accounts" tab
3. Click "Link account" next to Epic Games
4. Complete Epic Games authentication
5. Account will be linked and username/email displayed

## Security Features

- **Row Level Security**: Users can only access their own linked accounts
- **Token Management**: Access and refresh tokens stored securely
- **Error Handling**: Proper error messages without exposing sensitive data
- **Session Validation**: All operations require valid user session

## Testing

To test the Epic Games linking:
1. Ensure environment variables are set
2. Run the database migration
3. Start the development server
4. Navigate to profile page and test linking flow

## Troubleshooting

- **"Invalid redirect URI"**: Ensure callback URL matches exactly in Epic Games settings
- **"Invalid client credentials"**: Verify CLIENT_ID and CLIENT_SECRET are correct
- **"Database error"**: Ensure linked_accounts table exists and RLS policies are active
