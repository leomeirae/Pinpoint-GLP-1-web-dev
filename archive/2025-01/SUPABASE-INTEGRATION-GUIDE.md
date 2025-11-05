# Supabase Integration Guide - FASE 10

## Status: Migration Ready ✅

All code has been prepared for Supabase integration. Follow the steps below to complete the setup.

---

## Step 1: Apply SQL Migration to Supabase

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://iokunvykvndmczfzdbho.supabase.co
2. Click on "SQL Editor" in the left sidebar
3. Click "+ New Query"
4. Copy the entire content from `/supabase/migrations/001_initial_schema.sql`
5. Paste into the SQL Editor
6. Click "Run" to execute the migration

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref iokunvykvndmczfzdbho

# Run migrations
supabase db push
```

---

## Step 2: Verify Tables Were Created

After running the migration, verify in Supabase Dashboard:

1. Go to "Table Editor"
2. Check that these tables exist:
   - `profiles`
   - `applications`
   - `weights`
   - `settings`

3. Verify Row Level Security (RLS) is enabled on all tables

---

## Step 3: Configure Clerk + Supabase JWT

Since you're using Clerk for authentication, you need to configure JWT templates:

1. Go to Clerk Dashboard: https://dashboard.clerk.com
2. Navigate to "JWT Templates"
3. Create a new template named "supabase"
4. Add these claims:
   ```json
   {
     "aud": "authenticated",
     "exp": "{{user.exp}}",
     "iat": "{{user.iat}}",
     "iss": "https://iokunvykvndmczfzdbho.supabase.co/auth/v1",
     "sub": "{{user.id}}",
     "email": "{{user.primary_email_address}}",
     "role": "authenticated"
   }
   ```

---

## What Was Implemented

### 1. Database Schema (`/supabase/migrations/001_initial_schema.sql`)

**Tables Created:**
- `profiles` - User profile data (height, weight goals, medication info)
- `applications` - Injection records
- `weights` - Weight tracking
- `settings` - User preferences (theme, notifications, etc.)

**Features:**
- Row Level Security (RLS) enabled on all tables
- Indexes for performance
- Automatic `updated_at` triggers
- Foreign key constraints
- Cascade deletes for data integrity

### 2. Custom Hooks

**`/hooks/useProfile.ts`**
- Fetch, create, and update user profiles
- Auto-creates profile on first use
- Returns: `{ profile, loading, error, updateProfile, createProfile, refetch }`

**`/hooks/useApplications.ts`**
- CRUD operations for injection records
- Sorted by date (most recent first)
- Returns: `{ applications, loading, error, createApplication, updateApplication, deleteApplication, refetch }`

**`/hooks/useWeights.ts`**
- CRUD operations for weight logs
- Helper function to calculate weight differences
- Returns: `{ weights, loading, error, createWeight, updateWeight, deleteWeight, getWeightDifference, refetch }`

**`/hooks/useSettings.ts`**
- Fetch and update user settings
- Auto-creates default settings on first use
- Reset to defaults function
- Returns: `{ settings, loading, error, updateSettings, createSettings, resetSettings, refetch }`

### 3. Components Already Created (FASE 8 & 9)

**Calendar Screen:**
- `MonthCalendar` - 7x6 grid calendar
- `DayEventsList` - Event list for selected date
- `calendar-view.tsx` - Main calendar screen

**Settings Screen:**
- `SettingsSection` - Group settings
- `SettingsRow` - Individual setting items
- `UserProfile` - User profile card
- `ThemeSelector` - Theme chooser
- `AccentColorSelector` - Color picker
- `settings.tsx` - Complete settings screen

---

## Next Steps: Replace Mock Data

After applying the migration, the following files need to be updated to use real data:

### Priority 1: Core Screens

1. **`app/(tabs)/index.tsx`** - Dashboard/Summary
   - Replace mock data with `useProfile()`, `useApplications()`, `useWeights()`
   - Show real statistics

2. **`app/(tabs)/shots.tsx`** - Shots List
   - Replace MOCK_SHOTS with `useApplications()`

3. **`app/(tabs)/results.tsx`** - Results/Charts
   - Replace MOCK_WEIGHT_DATA with `useWeights()`
   - Replace MOCK_BMI_DATA with calculated BMI from weights

4. **`app/(tabs)/calendar-view.tsx`** - Calendar
   - Replace MOCK_EVENTS with combined data from `useApplications()` and `useWeights()`

### Priority 2: Forms

5. **`app/(tabs)/add-application.tsx`** - Add/Edit Injection
   - Use `createApplication()` or `updateApplication()`

6. **`app/(tabs)/add-weight.tsx`** - Add/Edit Weight
   - Use `createWeight()` or `updateWeight()`

### Priority 3: Settings Integration

7. **`lib/theme-context.tsx`** - Theme Context
   - Integrate with `useSettings()` hook
   - Save theme/accent changes to Supabase
   - Load theme from database on app start

---

## Testing Checklist

After integration is complete:

- [ ] User profile is created automatically on first login
- [ ] Can add new injections and they appear in database
- [ ] Can add weights and they appear in charts
- [ ] Calendar shows real injection and weight events
- [ ] Theme changes persist across app restarts
- [ ] All CRUD operations work (create, read, update, delete)
- [ ] RLS policies work (users only see their own data)
- [ ] App works offline (graceful error handling)
- [ ] Loading states show correctly
- [ ] Error messages are user-friendly

---

## Configuration Files

**Environment Variables (`.env.local`):**
```env
EXPO_PUBLIC_SUPABASE_URL=https://iokunvykvndmczfzdbho.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Supabase Client (`lib/supabase.ts`):**
- ✅ Already configured
- ✅ Uses SecureStore for token storage
- ✅ Auto-refresh enabled

---

## Troubleshooting

### "Profile not found" error
- Make sure the JWT template is configured in Clerk
- Check that user.id matches auth.uid() in Supabase

### "RLS policy violation" error
- Verify user is authenticated
- Check that Clerk JWT is being passed to Supabase
- Test with `useSupabaseAuth()` hook

### Data not showing
- Check browser/app console for errors
- Verify tables exist in Supabase
- Test queries directly in Supabase SQL Editor

### Theme not persisting
- Ensure `settings` table exists
- Check that `useSettings()` is called in ThemeContext
- Verify RLS policies allow user to update settings

---

## Support

If you encounter issues:
1. Check Supabase logs in Dashboard > Logs
2. Check React Native logs with `npx expo start`
3. Verify RLS policies are not blocking requests
4. Test auth token with: `supabase.auth.getSession()`

---

## Summary

**What's Done:**
- ✅ SQL migration created
- ✅ 4 custom hooks created (useProfile, useApplications, useWeights, useSettings)
- ✅ All UI components from FASE 8 & 9
- ✅ Supabase client configured

**What's Next:**
1. Apply SQL migration to Supabase
2. Configure Clerk JWT template
3. Replace mock data in screens with hooks
4. Test all CRUD operations
5. Integrate settings with ThemeContext
