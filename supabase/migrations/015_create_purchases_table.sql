-- Migration: 015_create_purchases_table.sql
-- Description: Creates the purchases table to track medication costs.

-- 1. Create the purchases table
CREATE TABLE public.purchases (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    user_id UUID DEFAULT auth.uid() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    medication_name TEXT,
    package_details TEXT, -- Ex: "2 canetas de 1.5mg"
    price NUMERIC,
    location TEXT,
    purchase_date DATE NOT NULL,
    receipt_photo_url TEXT,

    CONSTRAINT purchases_pkey PRIMARY KEY (id),
    CONSTRAINT purchases_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 2. Add comments to columns for clarity
COMMENT ON TABLE public.purchases IS 'Tracks medication purchases and associated costs for users.';
COMMENT ON COLUMN public.purchases.medication_name IS 'Name of the medication purchased.';
COMMENT ON COLUMN public.purchases.package_details IS 'Details about the package, e.g., "2 pens of 1.5mg".';
COMMENT ON COLUMN public.purchases.price IS 'Cost of the purchase.';
COMMENT ON COLUMN public.purchases.location IS 'Location where the purchase was made.';
COMMENT ON COLUMN public.purchases.purchase_date IS 'Date of the purchase.';
COMMENT ON COLUMN public.purchrases.receipt_photo_url IS 'URL to the receipt photo stored in Supabase Storage.';

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
--    Users can only see their own purchases.
CREATE POLICY "Allow individual read access on purchases"
ON public.purchases
FOR SELECT
USING (auth.uid() = user_id);

--    Users can only insert purchases for themselves.
CREATE POLICY "Allow individual insert access on purchases"
ON public.purchases
FOR INSERT
WITH CHECK (auth.uid() = user_id);

--    Users can only update their own purchases.
CREATE POLICY "Allow individual update access on purchases"
ON public.purchases
FOR UPDATE
USING (auth.uid() = user_id);

--    Users can only delete their own purchases.
CREATE POLICY "Allow individual delete access on purchases"
ON public.purchases
FOR DELETE
USING (auth.uid() = user_id);

-- Grant all operations to authenticated users for the policies to apply
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.purchases TO authenticated;
