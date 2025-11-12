-- Migration: 017_create_treatment_pauses_table.sql
-- Description: Creates the treatment_pauses table to track pauses in treatment.

-- 1. Create the treatment_pauses table
CREATE TABLE public.treatment_pauses (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    user_id UUID DEFAULT auth.uid() NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE, -- Can be NULL if the pause is ongoing
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    CONSTRAINT treatment_pauses_pkey PRIMARY KEY (id),
    CONSTRAINT treatment_pauses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 2. Add comments for clarity
COMMENT ON TABLE public.treatment_pauses IS 'Tracks periods when a user pauses their treatment.';
COMMENT ON COLUMN public.treatment_pauses.start_date IS 'The start date of the pause.';
COMMENT ON COLUMN public.treatment_pauses.end_date IS 'The end date of the pause. If NULL, the pause is currently active.';

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.treatment_pauses ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
CREATE POLICY "Allow individual read access on treatment_pauses"
ON public.treatment_pauses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow individual insert access on treatment_pauses"
ON public.treatment_pauses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow individual update access on treatment_pauses"
ON public.treatment_pauses FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow individual delete access on treatment_pauses"
ON public.treatment_pauses FOR DELETE USING (auth.uid() = user_id);

-- Grant all necessary operations
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.treatment_pauses TO authenticated;
