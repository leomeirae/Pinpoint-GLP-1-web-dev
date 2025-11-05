# 🚀 Supabase Setup - Complete Guide

## Quick Start (3 Steps)

Follow these steps in order to complete your Supabase integration:

---

## 📝 STEP 1: Apply Main Migration

### Go to Supabase Dashboard
https://iokunvykvndmczfzdbho.supabase.co

### Execute Migration
1. Click **"SQL Editor"** in left sidebar
2. Click **"+ New Query"**
3. Copy the entire content from:
   ```
   /Users/user/Desktop/mounjaro-tracker/supabase/migrations/001_initial_schema.sql
   ```
4. Paste into SQL Editor
5. Click **"Run"**

### Expected Result
You should see: `Success. No rows returned`

This creates 4 tables:
- ✅ `profiles` - User data
- ✅ `applications` - Injection records
- ✅ `weights` - Weight logs
- ✅ `settings` - User preferences

---

## 🔒 STEP 2: Fix Security Issue (community_stats)

### Check if Issue Exists
The Supabase linter flagged a `SECURITY DEFINER` view called `community_stats`.

### Fix Options

#### Option A: Drop the view (if not needed)
```sql
-- Run in SQL Editor
DROP VIEW IF EXISTS public.community_stats;
```

#### Option B: Get definition first, then recreate
```sql
-- 1. See what the view does
SELECT definition FROM pg_views WHERE viewname = 'community_stats';

-- 2. Run the fix script
```

Copy and run:
```
/Users/user/Desktop/mounjaro-tracker/supabase/fixes/fix_community_stats_security.sql
```

### Why This Matters
`SECURITY DEFINER` views can bypass Row Level Security (RLS) and expose data users shouldn't see. Our migration doesn't create any definer views - this is from existing database.

---

## ✅ STEP 3: Verify Migration Success

### Run Verification Script

Copy and run this in SQL Editor:
```
/Users/user/Desktop/mounjaro-tracker/supabase/verification/verify_migration.sql
```

### What It Checks

✅ **Tables Check** - All 4 tables exist
✅ **RLS Check** - Row Level Security enabled on all tables
✅ **Indexes Check** - Performance indexes created
✅ **Policies Check** - At least 10 RLS policies exist
✅ **Triggers Check** - 3 auto-update triggers exist
✅ **Functions Check** - update_updated_at_column exists
✅ **Security Audit** - No SECURITY DEFINER views

### Expected Output

If successful, you'll see:
```
✅ MIGRATION SUCCESSFUL - All checks passed!
```

If any check fails, review the detailed output to see what's missing.

---

## 🔧 Troubleshooting

### "relation auth.users does not exist"

**Cause:** Supabase auth schema not initialized
**Fix:** Your Supabase project needs auth enabled. This should be automatic, but if not:
1. Go to Authentication → Settings
2. Enable Email provider
3. Re-run migration

### "permission denied for schema public"

**Cause:** Insufficient permissions
**Fix:** Make sure you're logged in to Supabase Dashboard and executing as project owner

### "function uuid_generate_v4() does not exist"

**Cause:** uuid-ossp extension not enabled
**Fix:** Run this first:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Tables created but RLS failing

**Cause:** Clerk JWT not configured
**Fix:** See "Configure Clerk JWT" section below

---

## 🔐 STEP 4: Configure Clerk + Supabase JWT

Since you're using Clerk for authentication, configure JWT templates:

### In Clerk Dashboard

1. Go to: https://dashboard.clerk.com
2. Navigate to: **JWT Templates**
3. Click: **+ New Template**
4. Name: `supabase`
5. Add these claims:

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

6. Click **Save**

### Test JWT Configuration

In your app, the `useSupabaseAuth()` hook (from `lib/supabase.ts`) will automatically:
1. Get Clerk JWT with Supabase template
2. Pass it to Supabase client
3. Enable RLS policies based on user ID

---

## 📊 STEP 5: Test Database Access

### Quick Test in SQL Editor

```sql
-- This should return empty (no profiles yet)
SELECT * FROM profiles;

-- If you get "permission denied", JWT is not configured
-- If you get "0 rows", everything is working! ✅
```

### Test from App

The hooks will auto-create data on first use:

- `useProfile()` - Creates profile on first login
- `useSettings()` - Creates default settings on first login
- `useApplications()` - Returns empty array initially
- `useWeights()` - Returns empty array initially

---

## 📱 STEP 6: Integration with App (Optional)

The hooks are already created and ready to use! To replace mock data:

### Update These Files

1. **`app/(tabs)/index.tsx`** - Dashboard
   ```typescript
   import { useProfile } from '@/hooks/useProfile';
   import { useApplications } from '@/hooks/useApplications';
   import { useWeights } from '@/hooks/useWeights';

   const { profile } = useProfile();
   const { applications } = useApplications();
   const { weights } = useWeights();
   ```

2. **`app/(tabs)/shots.tsx`** - Shots list
   ```typescript
   const { applications, loading } = useApplications();
   ```

3. **`app/(tabs)/results.tsx`** - Charts
   ```typescript
   const { weights } = useWeights();
   const { profile } = useProfile();
   ```

4. **`app/(tabs)/calendar-view.tsx`** - Calendar
   ```typescript
   const { applications } = useApplications();
   const { weights } = useWeights();
   // Combine into events array
   ```

5. **`lib/theme-context.tsx`** - Theme persistence
   ```typescript
   const { settings, updateSettings } = useSettings();
   ```

---

## 🎯 Final Checklist

- [ ] Step 1: Main migration applied (001_initial_schema.sql)
- [ ] Step 2: Security issue fixed (community_stats)
- [ ] Step 3: Verification passed (all checks ✅)
- [ ] Step 4: Clerk JWT configured
- [ ] Step 5: Database access tested
- [ ] Step 6: App integration (optional)

---

## 📚 What You Have Now

### ✅ Database Schema
- 4 tables with proper relationships
- Row Level Security protecting user data
- Performance indexes
- Auto-updating timestamps

### ✅ Custom Hooks
- `useProfile()` - User profile CRUD
- `useApplications()` - Injection records CRUD
- `useWeights()` - Weight tracking CRUD
- `useSettings()` - User preferences CRUD

### ✅ Security
- RLS policies ensure data isolation
- Users only see their own data
- Clerk JWT integration for auth
- No SECURITY DEFINER vulnerabilities

### ✅ UI Components (from FASE 8 & 9)
- Complete Calendar screen
- Complete Settings screen
- All supporting components

---

## 🆘 Need Help?

### Check Logs
- **Supabase:** Dashboard → Logs → Postgres Logs
- **App:** `npx expo start` console output

### Common Issues
1. **RLS blocking queries** → Check Clerk JWT configuration
2. **Permission denied** → Verify user is authenticated
3. **Empty data** → Normal on first use, data creates automatically

### Test RLS Policies
```sql
-- Test as authenticated user
SET LOCAL role authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "test-user-id"}';
SELECT * FROM profiles WHERE id = 'test-user-id';
```

---

## 🎉 Success!

Once all steps are complete, your Mounjaro Tracker will have:
- Real-time data persistence
- Secure multi-user support
- Theme persistence across sessions
- Full CRUD operations on all data
- Production-ready database architecture

**Ready to test? Just apply the migration and run the verification! 🚀**
