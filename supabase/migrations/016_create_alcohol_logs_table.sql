-- Migration: 016_create_alcohol_logs_table.sql
-- Description: Creates the alcohol_logs table to track alcohol consumption days.

-- 1. Create the alcohol_logs table
CREATE TABLE public.alcohol_logs (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    user_id UUID DEFAULT auth.uid() NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    CONSTRAINT alcohol_logs_pkey PRIMARY KEY (id),
    CONSTRAINT alcohol_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    CONSTRAINT alcohol_logs_user_id_date_unique UNIQUE (user_id, date) -- A user can only have one entry per day
);

-- 2. Add comments for clarity
COMMENT ON TABLE public.alcohol_logs IS 'Tracks days where a user has logged alcohol consumption.';
COMMENT ON COLUMN public.alcohol_logs.date IS 'The specific date of alcohol consumption.';

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.alcohol_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
--    Users can only see their own logs.
CREATE POLICY "Allow individual read access on alcohol_logs"
ON public.alcohol_logs
FOR SELECT
USING (auth.uid() = user_id);

--    Users can only insert logs for themselves.
CREATE POLICY "Allow individual insert access on alcohol_logs"
ON public.alcohol_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

--    Users can only delete their own logs (e.g., to "unmark" a day).
CREATE POLICY "Allow individual delete access on alcohol_logs"
ON public.alcohol_logs
FOR DELETE
USING (auth.uid() = user_id);

-- Grant all necessary operations to authenticated users
GRANT SELECT, INSERT, DELETE ON TABLE public.alcohol_logs TO authenticated;
-- Note: Update is intentionally omitted as a user will either insert or delete a log for a specific day.
