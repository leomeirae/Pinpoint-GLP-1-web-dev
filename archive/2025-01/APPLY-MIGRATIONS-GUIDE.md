# 🗄️ COMPREHENSIVE GUIDE: Apply Supabase Migrations (003-007)

**Last Updated:** 2025-11-03
**Target Migrations:** 003, 004, 005, 006, 007
**Estimated Time:** 15-20 minutes

---

## 📋 TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [Migration Overview](#migration-overview)
3. [Step-by-Step Instructions](#step-by-step-instructions)
4. [Verification Queries](#verification-queries)
5. [Troubleshooting](#troubleshooting)
6. [Rollback Instructions](#rollback-instructions)

---

## ✅ PREREQUISITES

Before starting, ensure you have:

- [ ] Access to your Supabase project dashboard
- [ ] Project URL and credentials ready
- [ ] SQL Editor permissions (admin/owner role)
- [ ] Backup of current database (recommended)
- [ ] These migration files ready to copy

**IMPORTANT:** Migrations MUST be applied in sequence (003 → 004 → 005 → 006 → 007).

---

## 📊 MIGRATION OVERVIEW

### Migration 003: Avatar Personalization
- **Creates:** `user_avatars` table
- **Features:** Avatar styles, colors, evolution stages, levels
- **Dependencies:** Requires `profiles` table with `update_updated_at_column()` function
- **Impact:** Enables avatar customization system

### Migration 004: Goals System
- **Creates:** `user_goals` table
- **Features:** Personal goals, milestones, progress tracking
- **Dependencies:** Requires `profiles` table
- **Impact:** Enables personalized goal setting beyond weight loss

### Migration 005: Communication Preferences
- **Creates:** `communication_preferences` table
- **Features:** Tone, humor, formality, notification preferences
- **Dependencies:** Requires `profiles` table
- **Impact:** Enables personalized app communication style

### Migration 006: Insights System
- **Creates:** `user_insights`, `detected_patterns`, `health_scores` tables
- **Features:** AI insights, pattern detection, health scoring
- **Dependencies:** Requires `profiles`, `applications`, `weights` tables
- **Impact:** Enables automated insights and analytics

### Migration 007: Pain & Medication Tracking
- **Creates:** Adds `pain_level` and `medication_type` columns to `medication_applications`
- **Updates:** `applications` view and trigger functions
- **Dependencies:** Requires `medication_applications` table
- **Impact:** Enhanced injection tracking with pain levels

---

## 🚀 STEP-BY-STEP INSTRUCTIONS

### STEP 1: Access Supabase SQL Editor

1. **Navigate to Supabase Dashboard**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Sign in to your account

2. **Select Your Project**
   - Click on your "Mounjaro Tracker" project
   - Wait for the dashboard to load

3. **Open SQL Editor**
   - In the left sidebar, click on the **SQL Editor** icon (looks like `</>`)
   - OR navigate to: `SQL Editor` → `New Query`

4. **Create a New Query**
   - Click the **"+ New Query"** button
   - You'll see a blank SQL editor

**Screenshot Reference:**
```
Left Sidebar → SQL Editor (icon: </>) → + New Query button
```

---

### STEP 2: Apply Migration 003 - Avatar Personalization

**⏱️ Estimated Time:** 2 minutes

#### 2.1. Copy Migration SQL

```sql
-- Migration: 003_personalization_avatar.sql
-- Description: Add avatar personalization system
-- Created: 2025-11-01

-- Create user_avatars table
CREATE TABLE IF NOT EXISTS public.user_avatars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Avatar appearance
  style TEXT NOT NULL DEFAULT 'minimal',
  primary_color TEXT NOT NULL DEFAULT '#0891B2',
  accessories JSONB DEFAULT '[]'::jsonb,
  mood TEXT DEFAULT 'motivated',

  -- Avatar evolution
  level INTEGER DEFAULT 1,
  evolution_stage TEXT DEFAULT 'beginner',
  unlock_date TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id),

  -- Constraints
  CONSTRAINT valid_style CHECK (style IN ('abstract', 'minimal', 'illustrated', 'photo')),
  CONSTRAINT valid_mood CHECK (mood IN ('motivated', 'chill', 'determined', 'playful')),
  CONSTRAINT valid_evolution_stage CHECK (evolution_stage IN ('beginner', 'intermediate', 'advanced', 'master')),
  CONSTRAINT valid_level CHECK (level >= 1 AND level <= 100)
);

-- Enable Row Level Security
ALTER TABLE public.user_avatars ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view own avatar"
  ON public.user_avatars FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own avatar"
  ON public.user_avatars FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own avatar"
  ON public.user_avatars FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own avatar"
  ON public.user_avatars FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_avatars_user_id ON public.user_avatars(user_id);
CREATE INDEX idx_user_avatars_level ON public.user_avatars(level);
CREATE INDEX idx_user_avatars_evolution_stage ON public.user_avatars(evolution_stage);

-- Create trigger for updated_at
CREATE TRIGGER update_user_avatars_updated_at
  BEFORE UPDATE ON public.user_avatars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to auto-update evolution stage based on level
CREATE OR REPLACE FUNCTION update_avatar_evolution_stage()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-update evolution stage based on level
  IF NEW.level >= 40 THEN
    NEW.evolution_stage := 'master';
  ELSIF NEW.level >= 25 THEN
    NEW.evolution_stage := 'advanced';
  ELSIF NEW.level >= 10 THEN
    NEW.evolution_stage := 'intermediate';
  ELSE
    NEW.evolution_stage := 'beginner';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update evolution stage
CREATE TRIGGER auto_update_avatar_evolution_stage
  BEFORE INSERT OR UPDATE OF level ON public.user_avatars
  FOR EACH ROW
  EXECUTE FUNCTION update_avatar_evolution_stage();

-- Add comment for documentation
COMMENT ON TABLE public.user_avatars IS 'Stores user avatar customization and evolution data';
COMMENT ON COLUMN public.user_avatars.style IS 'Avatar visual style: abstract, minimal, illustrated, or photo';
COMMENT ON COLUMN public.user_avatars.accessories IS 'JSON array of unlocked accessories';
COMMENT ON COLUMN public.user_avatars.mood IS 'Current avatar mood/expression';
COMMENT ON COLUMN public.user_avatars.evolution_stage IS 'Auto-calculated based on level: beginner (1-9), intermediate (10-24), advanced (25-39), master (40+)';
```

#### 2.2. Execute Migration

1. Paste the SQL into the SQL Editor
2. Click **"Run"** button (or press `Ctrl/Cmd + Enter`)
3. Wait for "Success" message

#### 2.3. Verify Migration 003

Run this verification query:

```sql
-- Verify Migration 003
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_avatars'
ORDER BY ordinal_position;

-- Should return 11 columns: id, user_id, style, primary_color, accessories, mood, level, evolution_stage, unlock_date, created_at, updated_at
```

**Expected Result:** 11 rows showing all columns

**Checkpoint:**
- [ ] Migration executed without errors
- [ ] Table `user_avatars` exists
- [ ] 11 columns present
- [ ] RLS enabled

---

### STEP 3: Apply Migration 004 - Goals System

**⏱️ Estimated Time:** 2 minutes

#### 3.1. Copy Migration SQL

```sql
-- Migration: 004_personalization_goals.sql
-- Description: Add personalized goals system
-- Created: 2025-11-01

-- Create user_goals table
CREATE TABLE IF NOT EXISTS public.user_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Goal definition
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  -- Target & Timeline
  target_value NUMERIC(10, 2),
  target_unit TEXT,
  target_date TIMESTAMPTZ,

  -- Progress tracking
  current_value NUMERIC(10, 2) DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,

  -- Milestones
  milestones JSONB DEFAULT '[]'::jsonb,

  -- Customization
  celebration_style TEXT DEFAULT 'energetic',
  reminder_enabled BOOLEAN DEFAULT TRUE,

  -- Status
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_goal_type CHECK (type IN ('weight_loss', 'energy_boost', 'consistency', 'custom')),
  CONSTRAINT valid_celebration_style CHECK (celebration_style IN ('subtle', 'energetic', 'zen')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  CONSTRAINT valid_progress CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  CONSTRAINT valid_values CHECK (current_value >= 0 AND (target_value IS NULL OR target_value > 0))
);

-- Enable Row Level Security
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view own goals"
  ON public.user_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON public.user_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON public.user_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON public.user_goals FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_goals_user_id ON public.user_goals(user_id);
CREATE INDEX idx_user_goals_status ON public.user_goals(user_id, status);
CREATE INDEX idx_user_goals_type ON public.user_goals(user_id, type);
CREATE INDEX idx_user_goals_target_date ON public.user_goals(target_date) WHERE status = 'active';

-- Create trigger for updated_at
CREATE TRIGGER update_user_goals_updated_at
  BEFORE UPDATE ON public.user_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-update progress percentage
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-calculate progress percentage if target_value exists
  IF NEW.target_value IS NOT NULL AND NEW.target_value > 0 THEN
    NEW.progress_percentage := LEAST(100, GREATEST(0,
      ROUND((NEW.current_value / NEW.target_value) * 100)::INTEGER
    ));

    -- Auto-complete goal if 100% reached
    IF NEW.progress_percentage >= 100 AND OLD.status = 'active' THEN
      NEW.status := 'completed';
      NEW.completed_at := NOW();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update progress
CREATE TRIGGER auto_update_goal_progress
  BEFORE UPDATE OF current_value, target_value ON public.user_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_goal_progress();

-- Function to check milestone achievements
CREATE OR REPLACE FUNCTION check_milestone_achievements()
RETURNS TRIGGER AS $$
DECLARE
  milestone JSONB;
  updated_milestones JSONB := '[]'::jsonb;
  milestone_value NUMERIC;
  milestone_achieved BOOLEAN;
BEGIN
  -- Loop through milestones and check achievements
  FOR milestone IN SELECT * FROM jsonb_array_elements(NEW.milestones)
  LOOP
    milestone_value := (milestone->>'value')::NUMERIC;
    milestone_achieved := COALESCE((milestone->>'achieved')::BOOLEAN, FALSE);

    -- Mark as achieved if current value >= milestone value
    IF NOT milestone_achieved AND NEW.current_value >= milestone_value THEN
      milestone := jsonb_set(milestone, '{achieved}', 'true'::jsonb);
      milestone := jsonb_set(milestone, '{achieved_date}', to_jsonb(NOW()::TEXT));
    END IF;

    updated_milestones := updated_milestones || milestone;
  END LOOP;

  NEW.milestones := updated_milestones;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check milestones
CREATE TRIGGER auto_check_milestone_achievements
  BEFORE UPDATE OF current_value ON public.user_goals
  FOR EACH ROW
  WHEN (OLD.current_value IS DISTINCT FROM NEW.current_value)
  EXECUTE FUNCTION check_milestone_achievements();

-- Add comments for documentation
COMMENT ON TABLE public.user_goals IS 'Stores personalized user goals beyond just weight loss';
COMMENT ON COLUMN public.user_goals.type IS 'Goal type: weight_loss, energy_boost, consistency, or custom';
COMMENT ON COLUMN public.user_goals.milestones IS 'JSON array of milestone objects with value, label, achieved status, and date';
COMMENT ON COLUMN public.user_goals.celebration_style IS 'How to celebrate achievements: subtle, energetic, or zen';
COMMENT ON COLUMN public.user_goals.progress_percentage IS 'Auto-calculated from current_value / target_value';
```

#### 3.2. Execute Migration

1. Paste the SQL into a new query in SQL Editor
2. Click **"Run"**
3. Wait for "Success" message

#### 3.3. Verify Migration 004

```sql
-- Verify Migration 004
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'user_goals'
ORDER BY ordinal_position;

-- Check triggers and functions
SELECT
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'user_goals';

-- Should return: update_user_goals_updated_at, auto_update_goal_progress, auto_check_milestone_achievements
```

**Expected Result:** 17 columns, 3 triggers

**Checkpoint:**
- [ ] Migration executed without errors
- [ ] Table `user_goals` exists
- [ ] 17 columns present
- [ ] 3 triggers created
- [ ] RLS enabled

---

### STEP 4: Apply Migration 005 - Communication Preferences

**⏱️ Estimated Time:** 2 minutes

#### 4.1. Copy Migration SQL

```sql
-- Migration: 005_personalization_communication.sql
-- Description: Add communication style preferences (Tone & Voice)
-- Created: 2025-11-01

-- Create communication_preferences table
CREATE TABLE IF NOT EXISTS public.communication_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Communication style
  style TEXT NOT NULL DEFAULT 'friend',
  humor_level INTEGER DEFAULT 3,
  motivation_type TEXT DEFAULT 'balanced',

  -- Preferences
  use_emojis BOOLEAN DEFAULT TRUE,
  formality_level INTEGER DEFAULT 3,
  preferred_language TEXT DEFAULT 'en',

  -- Notification preferences
  notification_tone TEXT DEFAULT 'encouraging',
  notification_frequency TEXT DEFAULT 'normal',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id),

  -- Constraints
  CONSTRAINT valid_style CHECK (style IN ('coach', 'friend', 'scientist', 'minimalist')),
  CONSTRAINT valid_humor_level CHECK (humor_level BETWEEN 1 AND 5),
  CONSTRAINT valid_motivation_type CHECK (motivation_type IN ('data-driven', 'emotional', 'balanced')),
  CONSTRAINT valid_formality_level CHECK (formality_level BETWEEN 1 AND 5),
  CONSTRAINT valid_notification_tone CHECK (notification_tone IN ('encouraging', 'neutral', 'direct', 'playful')),
  CONSTRAINT valid_notification_frequency CHECK (notification_frequency IN ('minimal', 'normal', 'frequent'))
);

-- Enable Row Level Security
ALTER TABLE public.communication_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view own communication preferences"
  ON public.communication_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own communication preferences"
  ON public.communication_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own communication preferences"
  ON public.communication_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own communication preferences"
  ON public.communication_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_communication_preferences_user_id
  ON public.communication_preferences(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_communication_preferences_updated_at
  BEFORE UPDATE ON public.communication_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create helper function to get personalized message template
CREATE OR REPLACE FUNCTION get_message_template(
  p_user_id UUID,
  p_message_type TEXT,
  p_context JSONB DEFAULT '{}'::jsonb
) RETURNS TEXT AS $$
DECLARE
  prefs RECORD;
  template TEXT;
  emoji_suffix TEXT := '';
BEGIN
  -- Get user preferences
  SELECT * INTO prefs
  FROM public.communication_preferences
  WHERE user_id = p_user_id;

  -- Return default if no preferences found
  IF NOT FOUND THEN
    RETURN p_message_type;
  END IF;

  -- Add emojis based on preferences
  IF prefs.use_emojis AND (p_context->>'is_celebrating')::BOOLEAN THEN
    CASE prefs.notification_tone
      WHEN 'playful' THEN emoji_suffix := ' 🎉🎊';
      WHEN 'encouraging' THEN emoji_suffix := ' 🎉';
      WHEN 'neutral' THEN emoji_suffix := ' ✓';
      ELSE emoji_suffix := '';
    END CASE;
  END IF;

  -- Build template based on style
  -- This is a simplified version - in production would use more sophisticated logic
  -- or integrate with OpenAI for dynamic generation
  CASE prefs.style
    WHEN 'coach' THEN
      template := format('Great work! %s%s', p_message_type, emoji_suffix);
    WHEN 'friend' THEN
      template := format('Awesome! %s%s', p_message_type, emoji_suffix);
    WHEN 'scientist' THEN
      template := format('Data shows: %s', p_message_type);
    WHEN 'minimalist' THEN
      template := p_message_type;
    ELSE
      template := p_message_type || emoji_suffix;
  END CASE;

  RETURN template;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON TABLE public.communication_preferences IS 'Stores user preferences for app communication style and tone';
COMMENT ON COLUMN public.communication_preferences.style IS 'Communication style: coach, friend, scientist, or minimalist';
COMMENT ON COLUMN public.communication_preferences.humor_level IS 'Level of humor in messages (1=none, 5=maximum)';
COMMENT ON COLUMN public.communication_preferences.motivation_type IS 'Type of motivation: data-driven, emotional, or balanced';
COMMENT ON COLUMN public.communication_preferences.formality_level IS 'Level of formality (1=casual, 5=formal)';
COMMENT ON COLUMN public.communication_preferences.notification_tone IS 'Tone for notifications: encouraging, neutral, direct, or playful';
COMMENT ON COLUMN public.communication_preferences.notification_frequency IS 'Frequency of notifications: minimal, normal, or frequent';
COMMENT ON FUNCTION get_message_template IS 'Helper function to get personalized message template based on user preferences';
```

#### 4.2. Execute Migration

1. Paste the SQL into a new query
2. Click **"Run"**
3. Wait for "Success" message

#### 4.3. Verify Migration 005

```sql
-- Verify Migration 005
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'communication_preferences'
ORDER BY ordinal_position;

-- Check helper function exists
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'get_message_template';

-- Should return 1 row: get_message_template, FUNCTION
```

**Expected Result:** 11 columns, 1 function

**Checkpoint:**
- [ ] Migration executed without errors
- [ ] Table `communication_preferences` exists
- [ ] 11 columns present
- [ ] Function `get_message_template` created
- [ ] RLS enabled

---

### STEP 5: Apply Migration 006 - Insights System

**⏱️ Estimated Time:** 2 minutes

#### 5.1. Copy Migration SQL

```sql
-- Migration: 006_insights_system.sql
-- Fase 2: Sistema de Insights e Patterns

-- User insights (gerados automaticamente)
CREATE TABLE IF NOT EXISTS public.user_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  type TEXT NOT NULL, -- 'pattern' | 'achievement' | 'suggestion' | 'warning'
  category TEXT NOT NULL, -- 'weight' | 'consistency' | 'progress' | 'health'

  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,

  confidence NUMERIC(3, 2) DEFAULT 0.8, -- 0-1
  priority INTEGER DEFAULT 3, -- 1-5

  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,

  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_confidence CHECK (confidence >= 0 AND confidence <= 1),
  CONSTRAINT valid_priority CHECK (priority >= 1 AND priority <= 5)
);

-- Detected patterns
CREATE TABLE IF NOT EXISTS public.detected_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  pattern_type TEXT NOT NULL, -- 'weekly_cycle' | 'food_correlation' | 'sleep_impact'
  pattern_data JSONB NOT NULL,

  confidence NUMERIC(3, 2) NOT NULL,
  occurrences INTEGER DEFAULT 1,

  first_detected TIMESTAMPTZ DEFAULT NOW(),
  last_detected TIMESTAMPTZ DEFAULT NOW(),

  is_active BOOLEAN DEFAULT TRUE,

  CONSTRAINT valid_pattern_confidence CHECK (confidence >= 0 AND confidence <= 1)
);

-- Health score history
CREATE TABLE IF NOT EXISTS public.health_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  date DATE NOT NULL,

  overall_score INTEGER NOT NULL, -- 0-100
  consistency_score INTEGER NOT NULL,
  progress_score INTEGER NOT NULL,
  engagement_score INTEGER NOT NULL,
  data_quality_score INTEGER NOT NULL,

  trend TEXT, -- 'improving' | 'stable' | 'declining'

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, date),

  CONSTRAINT valid_overall CHECK (overall_score >= 0 AND overall_score <= 100),
  CONSTRAINT valid_consistency CHECK (consistency_score >= 0 AND consistency_score <= 100),
  CONSTRAINT valid_progress CHECK (progress_score >= 0 AND progress_score <= 100),
  CONSTRAINT valid_engagement CHECK (engagement_score >= 0 AND engagement_score <= 100),
  CONSTRAINT valid_data_quality CHECK (data_quality_score >= 0 AND data_quality_score <= 100)
);

-- Enable RLS
ALTER TABLE public.user_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detected_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users view own insights" ON public.user_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own insights" ON public.user_insights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System inserts insights" ON public.user_insights FOR INSERT WITH CHECK (true);

CREATE POLICY "Users view own patterns" ON public.detected_patterns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System manages patterns" ON public.detected_patterns FOR ALL WITH CHECK (true);

CREATE POLICY "Users view own scores" ON public.health_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System manages scores" ON public.health_scores FOR ALL WITH CHECK (true);

-- Indexes
CREATE INDEX idx_insights_user_created ON public.user_insights(user_id, created_at DESC);
CREATE INDEX idx_insights_unread ON public.user_insights(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_patterns_user_active ON public.detected_patterns(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_health_scores_user_date ON public.health_scores(user_id, date DESC);

-- Function: Calculate health score
CREATE OR REPLACE FUNCTION calculate_health_score(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB AS $$
DECLARE
  v_consistency INT := 0;
  v_progress INT := 0;
  v_engagement INT := 0;
  v_data_quality INT := 0;
  v_overall INT := 0;
  v_weights_count INT;
  v_apps_count INT;
BEGIN
  -- Consistency (last 30 days)
  SELECT COUNT(*) INTO v_apps_count
  FROM public.applications
  WHERE user_id = p_user_id AND date >= p_date - INTERVAL '30 days';
  v_consistency := LEAST(100, (v_apps_count * 25));

  -- Data Quality (recent logs)
  SELECT COUNT(*) INTO v_weights_count
  FROM public.weights
  WHERE user_id = p_user_id AND date >= p_date - INTERVAL '7 days';
  v_data_quality := LEAST(100, (v_weights_count * 20));

  -- Progress (goal completion)
  v_progress := 50; -- Default, TODO: calculate from goals

  -- Engagement
  v_engagement := 50; -- Default, TODO: calculate from app usage

  -- Overall (weighted average)
  v_overall := ROUND((v_consistency * 0.3 + v_progress * 0.3 + v_engagement * 0.2 + v_data_quality * 0.2));

  RETURN jsonb_build_object(
    'overall', v_overall,
    'consistency', v_consistency,
    'progress', v_progress,
    'engagement', v_engagement,
    'data_quality', v_data_quality
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE public.user_insights IS 'AI-generated insights for users';
COMMENT ON TABLE public.detected_patterns IS 'Automatically detected patterns in user data';
COMMENT ON TABLE public.health_scores IS 'Daily health score calculations';
```

#### 5.2. Execute Migration

1. Paste the SQL into a new query
2. Click **"Run"**
3. Wait for "Success" message

#### 5.3. Verify Migration 006

```sql
-- Verify Migration 006 - All 3 tables
SELECT
  table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name IN ('user_insights', 'detected_patterns', 'health_scores')
GROUP BY table_name
ORDER BY table_name;

-- Should return:
-- detected_patterns: 8 columns
-- health_scores: 10 columns
-- user_insights: 12 columns

-- Check function exists
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'calculate_health_score';
```

**Expected Result:** 3 tables created, 1 function

**Checkpoint:**
- [ ] Migration executed without errors
- [ ] Tables `user_insights`, `detected_patterns`, `health_scores` exist
- [ ] Function `calculate_health_score` created
- [ ] All RLS policies applied

---

### STEP 6: Apply Migration 007 - Pain & Medication Tracking

**⏱️ Estimated Time:** 2 minutes

**NOTE:** Use the standard migration file (007_add_pain_medication_fields.sql), not the "complete" version.

#### 6.1. Copy Migration SQL

```sql
-- Migration 007: Add pain_level and medication_type fields
-- This migration adds fields needed for the Shotsy-style Add Application screen
-- Note: applications is a VIEW based on medication_applications, so we update both

-- Add pain_level column to medication_applications table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'medication_applications'
    AND column_name = 'pain_level'
  ) THEN
    ALTER TABLE medication_applications ADD COLUMN pain_level INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add medication_type column to store medication name (mounjaro, ozempic, etc)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'medication_applications'
    AND column_name = 'medication_type'
  ) THEN
    ALTER TABLE medication_applications ADD COLUMN medication_type TEXT;
  END IF;
END $$;

-- Update applications VIEW to include new fields
CREATE OR REPLACE VIEW applications AS
SELECT
  id,
  user_id,
  application_date as date,
  dosage,
  COALESCE(injection_sites, '{}'::text[]) as injection_sites,
  COALESCE(side_effects_list, '{}'::text[]) as side_effects,
  notes,
  COALESCE(pain_level, 0) as pain_level,
  medication_type,
  created_at,
  COALESCE(updated_at, created_at) as updated_at
FROM medication_applications;

-- Update applications_insert function to include new fields
CREATE OR REPLACE FUNCTION applications_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO medication_applications (
    user_id,
    medication_id,
    medication_type,
    dosage,
    application_date,
    injection_sites,
    side_effects_list,
    notes,
    pain_level
  ) VALUES (
    NEW.user_id,
    (SELECT id FROM medications WHERE user_id = NEW.user_id AND active = true LIMIT 1),
    NEW.medication_type,
    NEW.dosage,
    NEW.date,
    NEW.injection_sites,
    NEW.side_effects,
    NEW.notes,
    COALESCE(NEW.pain_level, 0)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update applications_update function to include new fields
CREATE OR REPLACE FUNCTION applications_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE medication_applications SET
    dosage = NEW.dosage,
    application_date = NEW.date,
    injection_sites = NEW.injection_sites,
    side_effects_list = NEW.side_effects,
    notes = NEW.notes,
    pain_level = COALESCE(NEW.pain_level, 0),
    medication_type = NEW.medication_type,
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON COLUMN medication_applications.pain_level IS 'Pain level from 0 to 10';
COMMENT ON COLUMN medication_applications.medication_type IS 'Medication type ID (mounjaro, ozempic, wegovy, zepbound, tirzepatide, semaglutide)';
```

#### 6.2. Execute Migration

1. Paste the SQL into a new query
2. Click **"Run"**
3. Wait for "Success" message

#### 6.3. Verify Migration 007

```sql
-- Verify Migration 007
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'medication_applications'
  AND column_name IN ('pain_level', 'medication_type');

-- Should return 2 rows:
-- pain_level: integer, default 0
-- medication_type: text, null

-- Check view updated
SELECT
  table_name,
  view_definition
FROM information_schema.views
WHERE table_name = 'applications';

-- Should include pain_level and medication_type in SELECT
```

**Expected Result:** 2 new columns added, view updated

**Checkpoint:**
- [ ] Migration executed without errors
- [ ] Column `pain_level` added to `medication_applications`
- [ ] Column `medication_type` added to `medication_applications`
- [ ] View `applications` updated
- [ ] Functions `applications_insert` and `applications_update` updated

---

## ✅ VERIFICATION QUERIES

### Master Verification Script

Run this comprehensive check after all migrations:

```sql
-- ============================================
-- MASTER VERIFICATION SCRIPT
-- Run after applying all migrations (003-007)
-- ============================================

-- 1. Check all new tables exist
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

-- Expected: 6 rows (all BASE TABLE)

-- 2. Check RLS is enabled on all tables
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'user_avatars',
    'user_goals',
    'communication_preferences',
    'user_insights',
    'detected_patterns',
    'health_scores'
  );

-- Expected: All rowsecurity = true

-- 3. Check new columns in medication_applications
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'medication_applications'
  AND column_name IN ('pain_level', 'medication_type');

-- Expected: 2 rows

-- 4. Check all new functions exist
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'update_avatar_evolution_stage',
    'update_goal_progress',
    'check_milestone_achievements',
    'get_message_template',
    'calculate_health_score',
    'applications_insert',
    'applications_update'
  )
ORDER BY routine_name;

-- Expected: 7 rows

-- 5. Count RLS policies
SELECT
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'user_avatars',
    'user_goals',
    'communication_preferences',
    'user_insights',
    'detected_patterns',
    'health_scores'
  )
GROUP BY tablename
ORDER BY tablename;

-- Expected:
-- communication_preferences: 4 policies
-- detected_patterns: 2 policies
-- health_scores: 2 policies
-- user_avatars: 4 policies
-- user_goals: 4 policies
-- user_insights: 3 policies

-- 6. Test calculate_health_score function (if you have test user)
-- Replace 'your-user-id' with actual UUID
-- SELECT calculate_health_score('your-user-id'::UUID);

-- Expected: JSON object with scores

-- ============================================
-- ALL CHECKS PASSED? Migrations are complete!
-- ============================================
```

### Individual Table Verification

```sql
-- Verify user_avatars structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_avatars'
ORDER BY ordinal_position;

-- Verify user_goals structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_goals'
ORDER BY ordinal_position;

-- Verify communication_preferences structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'communication_preferences'
ORDER BY ordinal_position;

-- Verify insights tables structure
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('user_insights', 'detected_patterns', 'health_scores')
ORDER BY table_name, ordinal_position;
```

---

## 🔧 TROUBLESHOOTING

### Common Issues and Solutions

#### Issue 1: "relation 'profiles' does not exist"

**Cause:** Migration 001/002 not applied yet

**Solution:**
```sql
-- Check if profiles table exists
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'profiles';

-- If not exists, apply migrations 001 and 002 first
```

#### Issue 2: "function update_updated_at_column() does not exist"

**Cause:** Base schema missing trigger function

**Solution:**
```sql
-- Create the missing function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### Issue 3: "duplicate key value violates unique constraint"

**Cause:** Trying to re-run migration on existing table

**Solution:**
- All migrations use `CREATE TABLE IF NOT EXISTS`
- Safe to re-run
- If columns already exist, DO blocks will skip them (Migration 007)

#### Issue 4: "permission denied for table"

**Cause:** User doesn't have sufficient permissions

**Solution:**
- Ensure you're logged in as database owner
- Check role permissions:
```sql
SELECT current_user, current_database();
```

#### Issue 5: "applications view doesn't include new columns"

**Cause:** View not recreated properly

**Solution:**
```sql
-- Drop and recreate view
DROP VIEW IF EXISTS applications CASCADE;

-- Then re-run the CREATE OR REPLACE VIEW statement from Migration 007
```

#### Issue 6: RLS blocking inserts

**Cause:** RLS policies too restrictive

**Solution:**
```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'user_avatars';

-- Verify auth.uid() is working
SELECT auth.uid();
```

---

## 🔄 ROLLBACK INSTRUCTIONS

**CAUTION:** Only rollback if absolutely necessary. This will delete data!

### Rollback Migration 007

```sql
-- Remove columns from medication_applications
ALTER TABLE medication_applications
  DROP COLUMN IF EXISTS pain_level,
  DROP COLUMN IF EXISTS medication_type;

-- Restore original view
CREATE OR REPLACE VIEW applications AS
SELECT
  id,
  user_id,
  application_date as date,
  dosage,
  COALESCE(injection_sites, '{}'::text[]) as injection_sites,
  COALESCE(side_effects_list, '{}'::text[]) as side_effects,
  notes,
  created_at,
  COALESCE(updated_at, created_at) as updated_at
FROM medication_applications;
```

### Rollback Migration 006

```sql
-- Drop tables (CASCADE removes dependencies)
DROP TABLE IF EXISTS public.user_insights CASCADE;
DROP TABLE IF EXISTS public.detected_patterns CASCADE;
DROP TABLE IF EXISTS public.health_scores CASCADE;

-- Drop function
DROP FUNCTION IF EXISTS calculate_health_score(UUID, DATE);
```

### Rollback Migration 005

```sql
-- Drop table and function
DROP TABLE IF EXISTS public.communication_preferences CASCADE;
DROP FUNCTION IF EXISTS get_message_template(UUID, TEXT, JSONB);
```

### Rollback Migration 004

```sql
-- Drop table and functions
DROP TABLE IF EXISTS public.user_goals CASCADE;
DROP FUNCTION IF EXISTS update_goal_progress();
DROP FUNCTION IF EXISTS check_milestone_achievements();
```

### Rollback Migration 003

```sql
-- Drop table and functions
DROP TABLE IF EXISTS public.user_avatars CASCADE;
DROP FUNCTION IF EXISTS update_avatar_evolution_stage();
```

**Complete Rollback (All 003-007):**

```sql
-- Nuclear option - removes all personalization features
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

## 📝 POST-MIGRATION CHECKLIST

After completing all migrations:

- [ ] All 6 tables created successfully
- [ ] All 7 functions created successfully
- [ ] RLS enabled on all new tables
- [ ] RLS policies applied (19 total across all tables)
- [ ] Indexes created for performance
- [ ] Views updated (applications)
- [ ] Triggers created and working
- [ ] Master verification script passes
- [ ] No errors in Supabase logs
- [ ] Test queries run successfully

---

## 🎯 NEXT STEPS

After migrations are applied:

1. **Update Application Code**
   - TypeScript types may need regeneration
   - Update hooks to use new tables
   - Test avatar, goals, and communication features

2. **Test Personalization Features**
   - Create test avatar
   - Set test goals
   - Update communication preferences
   - Verify insights calculation

3. **Monitor Performance**
   - Check query execution times
   - Verify indexes are being used
   - Monitor RLS policy performance

4. **Enable Features in App**
   - Onboarding flow should now save to new tables
   - Dashboard can display personalized content
   - Settings can update communication preferences

---

## 📞 SUPPORT

If you encounter issues:

1. **Check Supabase Logs**
   - Dashboard → Logs → Postgres Logs
   - Look for detailed error messages

2. **Verify Prerequisites**
   - Ensure migrations 001-002 are applied
   - Check user permissions
   - Verify database is active

3. **Common Solutions**
   - Refresh SQL Editor page
   - Clear browser cache
   - Try in incognito mode
   - Check Supabase service status

---

## 📊 MIGRATION SUMMARY

| Migration | Tables Created | Functions Created | Triggers Created | Estimated Time |
|-----------|----------------|-------------------|------------------|----------------|
| 003       | 1              | 1                 | 2                | 2 min          |
| 004       | 1              | 2                 | 3                | 2 min          |
| 005       | 1              | 1                 | 1                | 2 min          |
| 006       | 3              | 1                 | 0                | 2 min          |
| 007       | 0 (alters)     | 0 (updates)       | 0 (updates)      | 2 min          |
| **TOTAL** | **6**          | **5 new + 2 updated** | **6**        | **10-15 min**  |

---

**Document Version:** 1.0
**Last Updated:** 2025-11-03
**Status:** Ready for production use

Good luck with your migrations! 🚀
