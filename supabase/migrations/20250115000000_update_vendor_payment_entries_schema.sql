-- Update vendor_payment_entries table schema
-- Change VARCHAR(255) columns to text for better flexibility

-- First, alter the column types
ALTER TABLE vendor_payment_entries 
ALTER COLUMN task_name TYPE text;

ALTER TABLE vendor_payment_entries 
ALTER COLUMN project_name TYPE text;

-- Update RLS policies to use auth.email() instead of auth.uid()
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view entries for their submissions" ON vendor_payment_entries;
DROP POLICY IF EXISTS "Users can insert entries for their submissions" ON vendor_payment_entries;

-- Recreate policies with correct auth.email() usage
CREATE POLICY "Users can view entries for their submissions"
ON vendor_payment_entries
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM vendor_payment_submissions
        WHERE vendor_payment_submissions.id = vendor_payment_entries.submission_id
        AND vendor_payment_submissions.cf_email = auth.email()::text
    )
);

CREATE POLICY "Users can insert entries for their submissions"
ON vendor_payment_entries
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM vendor_payment_submissions
        WHERE vendor_payment_submissions.id = vendor_payment_entries.submission_id
        AND vendor_payment_submissions.cf_email = auth.email()::text
    )
);

-- Also update the vendor_payment_submissions policies if they're using auth.uid()
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own submissions based on email" ON vendor_payment_submissions;
DROP POLICY IF EXISTS "Users can insert their own submissions" ON vendor_payment_submissions;
DROP POLICY IF EXISTS "Users can delete their own submissions" ON vendor_payment_submissions;

-- Recreate policies with correct auth.email() usage
CREATE POLICY "Users can view their own submissions based on email"
ON vendor_payment_submissions
FOR SELECT
USING (auth.email() = cf_email);

CREATE POLICY "Users can insert their own submissions"
ON vendor_payment_submissions
FOR INSERT
WITH CHECK (auth.email() = cf_email);

CREATE POLICY "Users can delete their own submissions"
ON vendor_payment_submissions
FOR DELETE
USING (auth.email() = cf_email); 