-- Create vendor_payment_entries table
CREATE TABLE IF NOT EXISTS vendor_payment_entries (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER NOT NULL REFERENCES vendor_payment_submissions(id) ON DELETE CASCADE,
    task_name text NOT NULL,
    project_name text NOT NULL,
    work_hours DECIMAL(10,2) NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    entry_pay DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_vendor_payment_entries_submission_id 
ON vendor_payment_entries(submission_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE vendor_payment_entries ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view entries for their submissions
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

-- Policy to allow users to insert entries for their submissions
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

-- Create updated_at trigger
CREATE TRIGGER update_vendor_payment_entries_updated_at
    BEFORE UPDATE ON vendor_payment_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 