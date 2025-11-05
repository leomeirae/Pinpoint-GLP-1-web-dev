# 🚀 MIGRATIONS QUICK REFERENCE

**Quick Guide for Applying Supabase Migrations 003-007**

---

## ⚡ QUICK START (5 Steps)

1. **Open Supabase SQL Editor**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Select your project
   - Click "SQL Editor" in left sidebar
   - Click "+ New Query"

2. **Apply Migrations in Order**
   - Run migrations 003 → 004 → 005 → 006 → 007
   - Copy SQL from full guide
   - Paste into SQL Editor
   - Click "Run" button
   - Wait for "Success" message

3. **Verify Each Migration**
   - Run verification queries after each migration
   - Check for errors in output
   - Confirm tables/functions created

4. **Run Master Verification**
   - After all migrations complete
   - Run master verification script
   - Ensure all checks pass

5. **Update App Code**
   - Regenerate TypeScript types (optional)
   - Test personalization features
   - Monitor for errors

---

## 📊 MIGRATION OVERVIEW

### Migration 003: Avatar Personalization
```
Creates: user_avatars table
Features: Avatar styles, colors, levels, evolution
Time: 2 minutes
```

### Migration 004: Goals System
```
Creates: user_goals table
Features: Personal goals, milestones, progress tracking
Time: 2 minutes
```

### Migration 005: Communication Preferences
```
Creates: communication_preferences table
Features: Tone, humor, formality settings
Time: 2 minutes
```

### Migration 006: Insights System
```
Creates: user_insights, detected_patterns, health_scores tables
Features: AI insights, pattern detection, health scoring
Time: 2 minutes
```

### Migration 007: Pain & Medication Tracking
```
Creates: Adds pain_level and medication_type columns
Updates: applications view and trigger functions
Time: 2 minutes
```

---

## ✅ VERIFICATION CHECKLIST

After all migrations:

```sql
-- Quick verification query
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'user_avatars',
    'user_goals',
    'communication_preferences',
    'user_insights',
    'detected_patterns',
    'health_scores'
  )
ORDER BY table_name;

-- Should return 6 tables
```

Expected results:
- [ ] 6 new tables created
- [ ] 5 new functions created
- [ ] 2 functions updated
- [ ] RLS enabled on all tables
- [ ] No errors in Supabase logs

---

## 🔧 TROUBLESHOOTING

### "relation 'profiles' does not exist"
→ Apply migrations 001 and 002 first

### "function update_updated_at_column() does not exist"
→ Create the function (see full guide)

### "permission denied"
→ Check you're logged in as database owner

### "duplicate key constraint"
→ Safe to ignore, means migration already applied

---

## 📂 FILE LOCATIONS

```
supabase/migrations/
├── 003_personalization_avatar.sql
├── 004_personalization_goals.sql
├── 005_personalization_communication.sql
├── 006_insights_system.sql
└── 007_add_pain_medication_fields.sql
```

---

## 🎯 WHAT EACH MIGRATION ENABLES

| Migration | App Feature |
|-----------|-------------|
| 003 | Avatar customization in onboarding |
| 004 | Goal setting and progress tracking |
| 005 | Personalized app communication style |
| 006 | Automated insights and health scoring |
| 007 | Pain level and medication type tracking |

---

## 📝 QUICK ROLLBACK

**CAUTION:** Only if necessary!

```sql
-- Rollback all migrations 003-007
BEGIN;

DROP TABLE IF EXISTS public.user_avatars CASCADE;
DROP TABLE IF EXISTS public.user_goals CASCADE;
DROP TABLE IF EXISTS public.communication_preferences CASCADE;
DROP TABLE IF EXISTS public.user_insights CASCADE;
DROP TABLE IF EXISTS public.detected_patterns CASCADE;
DROP TABLE IF EXISTS public.health_scores CASCADE;

DROP FUNCTION IF EXISTS update_avatar_evolution_stage();
DROP FUNCTION IF EXISTS update_goal_progress();
DROP FUNCTION IF EXISTS check_milestone_achievements();
DROP FUNCTION IF EXISTS get_message_template(UUID, TEXT, JSONB);
DROP FUNCTION IF EXISTS calculate_health_score(UUID, DATE);

ALTER TABLE medication_applications
  DROP COLUMN IF EXISTS pain_level,
  DROP COLUMN IF EXISTS medication_type;

COMMIT;
```

---

## 🚀 AFTER MIGRATION

1. Test onboarding flow
2. Verify avatar creation
3. Create test goal
4. Update communication preferences
5. Check insights calculation
6. Test pain level tracking

---

## 📞 NEED HELP?

See full guide: `APPLY-MIGRATIONS-GUIDE.md`

---

**Total Time:** 10-15 minutes
**Difficulty:** Easy
**Risk Level:** Low (safe to re-run)
