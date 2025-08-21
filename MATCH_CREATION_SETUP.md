# Match Creation System Setup Guide

## Overview
The match creation system has been successfully implemented to work with your existing database schema. This guide will help you set up and test the new functionality.

## Database Migration

### Step 1: Run the Migration Script
Execute the migration script in your Supabase SQL editor:

```sql
-- File: database/matches_table_migration.sql
-- This script adds the necessary columns to your existing matches table
```

**What the migration does:**
- Adds `match_type`, `entry_fee`, `prize`, `status`, and `expires_at` columns
- Updates existing data to work with the new system
- Creates performance indexes
- Preserves all your existing data

### Step 2: Update User Authentication (Important!)
In `src/app/api/matches/route.ts`, line 30, replace the placeholder user ID:

```typescript
// Current placeholder:
user_id: '00000000-0000-0000-0000-000000000000'

// Replace with actual user authentication:
user_id: session?.user?.id || 'anonymous-user-id'
```

## Features Implemented

### ✅ Create Match Modal
- **Location**: `/matches` page → "Create Match" button
- **Fields**: Public/Private, Game Mode, First To, Platform, Region, Team Size, Entry Fee
- **Loading**: Shows spinner animation during creation
- **Validation**: All required fields validated before submission

### ✅ Database Integration
- **API Endpoints**: 
  - `POST /api/matches` - Create new match
  - `GET /api/matches/[id]` - Get match details
- **Data Mapping**: Works with your existing schema structure
- **Auto-calculations**: Prize = (entry_fee × 2 × 0.85)

### ✅ Dynamic Match Page
- **URL**: `/match/[id]` - Shows individual match details
- **Dynamic Data**: All values pulled from database:
  - Match title (e.g., "1v1 Box Fight")
  - Entry fee and prize amounts
  - Platform, Region, Game Mode, First To
  - Creation date/time
- **Loading States**: Shows spinner while fetching data
- **Error Handling**: Graceful handling of missing matches

## Schema Compatibility

### Your Existing Schema → New System Mapping:
```
betting_amount → entry_fee (for display)
is_public → match_type (true = 'public', false = 'private')
team_size (integer) → team_size display (1 = "1v1", 2 = "2v2", etc.)
game_mode (enum) → converted to string for frontend
platform (enum) → converted to string for frontend
region (enum) → converted to string for frontend
```

### New Columns Added:
- `match_type` - 'public' or 'private'
- `entry_fee` - Decimal amount for entry
- `prize` - Calculated prize amount
- `status` - Match status ('waiting', 'ready', 'playing', etc.)
- `expires_at` - When match expires (30 min default)

## Testing the System

### 1. Test Match Creation:
1. Navigate to `/matches`
2. Click "Create Match" button
3. Fill out the form with test data
4. Click "Create a match" 
5. Watch for loading animation
6. Should redirect to new match page

### 2. Test Match Display:
1. After creation, verify the match page shows:
   - Correct game mode title
   - Actual entry fee amount
   - Calculated prize
   - Platform/region names
   - Creation timestamp

### 3. Test Direct Match Access:
1. Copy a match ID from database
2. Navigate to `/match/[id]`
3. Should load match details or show "Match Not Found"

## Enum Type Handling

Your database uses enum types (`GameMode`, `Platform`, `Region`, `MatchResult`). The system handles these by:

1. **API Layer**: Accepts string values and lets Supabase handle enum conversion
2. **Display Layer**: Maps enum values to user-friendly names
3. **Migration**: Creates a view (`matches_view`) that converts enums to strings

## Troubleshooting

### Common Issues:

1. **"Match not found" errors**:
   - Check if migration script ran successfully
   - Verify match ID exists in database

2. **Enum constraint errors**:
   - Ensure your enum types accept the values being sent
   - Check Supabase logs for specific constraint violations

3. **User ID errors**:
   - Update the placeholder user ID in the API
   - Implement proper authentication

4. **RLS (Row Level Security) issues**:
   - Check your existing RLS policies
   - May need to update policies for new columns

## Next Steps

1. **Run the migration script** in Supabase
2. **Update user authentication** in the API
3. **Test the complete flow** from creation to display
4. **Customize styling** if needed for your design system

## File Structure
```
src/
├── app/
│   ├── api/matches/
│   │   ├── route.ts (Create/List matches)
│   │   └── [id]/route.ts (Get single match)
│   ├── matches/
│   │   ├── page.tsx (Matches listing page)
│   │   └── MatchesClient.tsx (Client component)
│   └── match/[id]/
│       └── page.tsx (Dynamic match page)
├── components/
│   └── CreateMatchModal.tsx (Match creation modal)
└── utils/
    └── supabaseClient.ts (Database client)

database/
├── matches_table.sql (Original schema - reference)
└── matches_table_migration.sql (Migration for existing table)
```

The system is now ready to use with your existing database structure! 🚀
