-- Create vendor_payment_submissions table
CREATE TABLE IF NOT EXISTS vendor_payment_submissions (
    id SERIAL PRIMARY KEY,
    cf_email VARCHAR(255) NOT NULL,
    cf_name VARCHAR(255) NOT NULL,
    cf_tier VARCHAR(50) NOT NULL,
    total_pay DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_vendor_payment_submissions_cf_email 
ON vendor_payment_submissions(cf_email);


-- Add RLS (Row Level Security) policies
ALTER TABLE vendor_payment_submissions ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own submissions
CREATE POLICY "Users can view their own submissions"
ON vendor_payment_submissions
FOR SELECT
USING (auth.uid()::text = cf_email);

-- Policy to allow users to insert their own submissions
CREATE POLICY "Users can insert their own submissions"
ON vendor_payment_submissions
FOR INSERT
WITH CHECK (auth.uid()::text = cf_email);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vendor_payment_submissions_updated_at
    BEFORE UPDATE ON vendor_payment_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 