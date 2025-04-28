-- Create vendor_payment_email_logs table
create table if not exists public.vendor_payment_email_logs (
  id bigint primary key generated always as identity,
  project_name text null,
  cf_email text null,
  month date not null,
  sent_at timestamp with time zone,
  status text not null,
  error_message text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint unique_project_person_month unique (project_name, cf_email, month)
);

-- Drop old unique constraint if it exists (handle migration scenario)
-- Note: This might need adjustment based on actual migration management
DO $$
BEGIN
  IF EXISTS(
    SELECT constraint_name
    FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'vendor_payment_email_logs' AND constraint_name = 'unique_project_month'
  ) THEN
    ALTER TABLE public.vendor_payment_email_logs DROP CONSTRAINT unique_project_month;
  END IF;
END
$$;

-- Drop old index if it exists
DROP INDEX IF EXISTS public.idx_vendor_payment_email_logs_project_month;

-- Create index for faster lookups on month
create index if not exists idx_vendor_payment_email_logs_month 
  on public.vendor_payment_email_logs(month);

-- Update index for project/person lookups
create index if not exists idx_vendor_payment_email_logs_project_person_month 
  on public.vendor_payment_email_logs(project_name, cf_email, month);

-- Add RLS policies
alter table public.vendor_payment_email_logs enable row level security;

-- Allow service role to access all records
create policy "Service role can access all email logs"
  on public.vendor_payment_email_logs
  for all
  to service_role
  using (true)
  with check (true);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger set_updated_at
  before update on public.vendor_payment_email_logs
  for each row
  execute function public.handle_updated_at();
