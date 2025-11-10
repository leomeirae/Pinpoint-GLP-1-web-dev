-- Migration 011: V0 Integration Enhancements
-- Adds missing fields, RLS policies, and indexes

-- 1. Add missing fields to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS current_weight NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS treatment_start_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS device_type TEXT,
  ADD COLUMN IF NOT EXISTS weight_unit TEXT DEFAULT 'kg',
  ADD COLUMN IF NOT EXISTS height_unit TEXT DEFAULT 'cm',
  ADD COLUMN IF NOT EXISTS food_noise_day TEXT,
  ADD COLUMN IF NOT EXISTS weight_loss_rate TEXT,
  ADD COLUMN IF NOT EXISTS motivation_type TEXT,
  ADD COLUMN IF NOT EXISTS daily_routine TEXT,
  ADD COLUMN IF NOT EXISTS side_effects_concerns TEXT,
  ADD COLUMN IF NOT EXISTS difficult_days TEXT;

-- Ensure onboarding_completed exists
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- 2. User Identity Constraints
-- Add UNIQUE constraint on clerk_id
DO $$ 
BEGIN
  ALTER TABLE public.users
    ADD CONSTRAINT users_clerk_id_unique UNIQUE (clerk_id);
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Constraint already exists
END $$;

-- Note: clerk_id is TEXT to match auth.uid()::text conversion
-- This is intentional because Clerk provides string IDs, not UUIDs
-- We convert auth.uid() to text for comparison: auth.uid()::text = clerk_id
-- Type parity: auth.uid() returns UUID, we cast to text for comparison

-- 3. Enable RLS on all tables (explicit)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_applications ENABLE ROW LEVEL SECURITY;

-- 4. Ensure Foreign Keys with Cascades
-- Verify weight_logs.user_id has ON DELETE CASCADE
DO $$
BEGIN
  -- Check if FK exists, if not create it
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'weight_logs_user_id_fkey'
    AND contype = 'f'
  ) THEN
    ALTER TABLE public.weight_logs
      ADD CONSTRAINT weight_logs_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  ELSE
    -- Update existing FK to ensure CASCADE
    ALTER TABLE public.weight_logs
      DROP CONSTRAINT IF EXISTS weight_logs_user_id_fkey;
    ALTER TABLE public.weight_logs
      ADD CONSTRAINT weight_logs_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Verify medication_applications.user_id has ON DELETE CASCADE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'medication_applications_user_id_fkey'
    AND contype = 'f'
  ) THEN
    ALTER TABLE public.medication_applications
      ADD CONSTRAINT medication_applications_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  ELSE
    ALTER TABLE public.medication_applications
      DROP CONSTRAINT IF EXISTS medication_applications_user_id_fkey;
    ALTER TABLE public.medication_applications
      ADD CONSTRAINT medication_applications_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5. Explicit RLS Policies (Idempotent)
-- Policies for users table
DO $$
BEGIN
  -- Policy: Users can read their own data
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'users' AND policyname = 'Users can read own data'
  ) THEN
    CREATE POLICY "Users can read own data"
      ON public.users
      FOR SELECT
      USING (auth.uid()::text = clerk_id);
  END IF;

  -- Policy: Users can update their own data
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'users' AND policyname = 'Users can update own data'
  ) THEN
    CREATE POLICY "Users can update own data"
      ON public.users
      FOR UPDATE
      USING (auth.uid()::text = clerk_id);
  END IF;

  -- Policy: Users can insert their own data (via trigger)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'users' AND policyname = 'Users can insert own data'
  ) THEN
    CREATE POLICY "Users can insert own data"
      ON public.users
      FOR INSERT
      WITH CHECK (auth.uid()::text = clerk_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Policy already exists
END $$;

-- Policies for weight_logs table (Idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'weight_logs' AND policyname = 'Users can read own weight logs'
  ) THEN
    CREATE POLICY "Users can read own weight logs"
      ON public.weight_logs
      FOR SELECT
      USING (
        user_id IN (
          SELECT id FROM public.users WHERE clerk_id = auth.uid()::text
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'weight_logs' AND policyname = 'Users can insert own weight logs'
  ) THEN
    CREATE POLICY "Users can insert own weight logs"
      ON public.weight_logs
      FOR INSERT
      WITH CHECK (
        user_id IN (
          SELECT id FROM public.users WHERE clerk_id = auth.uid()::text
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'weight_logs' AND policyname = 'Users can update own weight logs'
  ) THEN
    CREATE POLICY "Users can update own weight logs"
      ON public.weight_logs
      FOR UPDATE
      USING (
        user_id IN (
          SELECT id FROM public.users WHERE clerk_id = auth.uid()::text
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'weight_logs' AND policyname = 'Users can delete own weight logs'
  ) THEN
    CREATE POLICY "Users can delete own weight logs"
      ON public.weight_logs
      FOR DELETE
      USING (
        user_id IN (
          SELECT id FROM public.users WHERE clerk_id = auth.uid()::text
        )
      );
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Policy already exists
END $$;

-- Policies for medication_applications table (Idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'medication_applications' AND policyname = 'Users can read own applications'
  ) THEN
    CREATE POLICY "Users can read own applications"
      ON public.medication_applications
      FOR SELECT
      USING (
        user_id IN (
          SELECT id FROM public.users WHERE clerk_id = auth.uid()::text
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'medication_applications' AND policyname = 'Users can insert own applications'
  ) THEN
    CREATE POLICY "Users can insert own applications"
      ON public.medication_applications
      FOR INSERT
      WITH CHECK (
        user_id IN (
          SELECT id FROM public.users WHERE clerk_id = auth.uid()::text
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'medication_applications' AND policyname = 'Users can update own applications'
  ) THEN
    CREATE POLICY "Users can update own applications"
      ON public.medication_applications
      FOR UPDATE
      USING (
        user_id IN (
          SELECT id FROM public.users WHERE clerk_id = auth.uid()::text
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'medication_applications' AND policyname = 'Users can delete own applications'
  ) THEN
    CREATE POLICY "Users can delete own applications"
      ON public.medication_applications
      FOR DELETE
      USING (
        user_id IN (
          SELECT id FROM public.users WHERE clerk_id = auth.uid()::text
        )
      );
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Policy already exists
END $$;

-- 6. Performance Indexes
-- Index for weight_logs queries (user_id, date)
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date
  ON public.weight_logs(user_id, date DESC);

-- Index for medication_applications queries (user_id, application_date)
CREATE INDEX IF NOT EXISTS idx_medication_applications_user_date
  ON public.medication_applications(user_id, application_date DESC);

-- Index for users onboarding_completed
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed
  ON public.users(onboarding_completed);

-- Index for users treatment_start_date
CREATE INDEX IF NOT EXISTS idx_users_treatment_start_date
  ON public.users(treatment_start_date);

-- 7. Verification Function
CREATE OR REPLACE FUNCTION verify_migration_011()
RETURNS TABLE (
  check_name TEXT,
  status TEXT,
  details TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    'Users table columns'::TEXT,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name IN (
          'current_weight', 'treatment_start_date', 'device_type',
          'weight_unit', 'height_unit', 'onboarding_completed'
        )
      ) THEN 'PASS'::TEXT
      ELSE 'FAIL'::TEXT
    END,
    'Check if all new columns exist'::TEXT
  UNION ALL
  SELECT
    'RLS Enabled'::TEXT,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM pg_tables
        WHERE tablename IN ('users', 'weight_logs', 'medication_applications')
        AND rowsecurity = true
      ) THEN 'PASS'::TEXT
      ELSE 'FAIL'::TEXT
    END,
    'Check if RLS is enabled on all tables'::TEXT
  UNION ALL
  SELECT
    'RLS Policies'::TEXT,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'users'
        AND policyname LIKE '%own%'
      ) THEN 'PASS'::TEXT
      ELSE 'FAIL'::TEXT
    END,
    'Check if RLS policies exist'::TEXT
  UNION ALL
  SELECT
    'Foreign Keys with CASCADE'::TEXT,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname IN ('weight_logs_user_id_fkey', 'medication_applications_user_id_fkey')
        AND confdeltype = 'c'
      ) THEN 'PASS'::TEXT
      ELSE 'FAIL'::TEXT
    END,
    'Check if foreign keys have ON DELETE CASCADE'::TEXT
  UNION ALL
  SELECT
    'Indexes'::TEXT,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname IN (
          'idx_weight_logs_user_date',
          'idx_medication_applications_user_date',
          'idx_users_onboarding_completed',
          'idx_users_treatment_start_date'
        )
      ) THEN 'PASS'::TEXT
      ELSE 'FAIL'::TEXT
    END,
    'Check if indexes exist'::TEXT;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_catalog;

