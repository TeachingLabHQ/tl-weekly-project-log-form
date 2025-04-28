-- Create vendor_payment_email_logs table
create table if not exists public.vendor_payment_email_logs (
  id bigint primary key generated always as identity,
  project_name text null,
  month date not null,
  sent_at timestamp with time zone,
  status text not null,
  error_message text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint unique_project_month unique (project_name, month)
);

-- Create index for faster lookups
create index if not exists idx_vendor_payment_email_logs_month 
  on public.vendor_payment_email_logs(month);

-- Add index for project lookups
create index if not exists idx_vendor_payment_email_logs_project_month 
  on public.vendor_payment_email_logs(project_name, month);

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
