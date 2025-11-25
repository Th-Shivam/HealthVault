-- 1. Create the 'records' table
create table if not exists records (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references auth.users(id) not null,
  title text not null,
  description text,
  file_url text not null,
  uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS) on the table
alter table records enable row level security;

-- 3. Create policies for 'records' table
-- Allow users to view their own records
create policy "Users can view their own records"
  on records for select
  using (auth.uid() = patient_id);

-- Allow users to insert their own records
create policy "Users can insert their own records"
  on records for insert
  with check (auth.uid() = patient_id);

-- 4. Create the storage bucket 'medical-records'
-- Note: We are making this public to match the current code implementation using getPublicUrl.
-- For a real medical app, you would want this to be private and use signed URLs.
insert into storage.buckets (id, name, public)
values ('medical-records', 'medical-records', true)
on conflict (id) do nothing;

-- 5. Set up storage policies
-- Allow authenticated users to upload files
create policy "Authenticated users can upload files"
  on storage.objects for insert
  with check (
    bucket_id = 'medical-records' and
    auth.role() = 'authenticated'
  );

-- Allow users to view files (since it's public, but good to have explicit policy if we switch to private)
create policy "Anyone can view files"
  on storage.objects for select
  using ( bucket_id = 'medical-records' );

-- 6. Create the 'grants' table
create table if not exists grants (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references auth.users(id) not null,
  doctor_email text, -- Nullable for QR
  otp_hash text,     -- Nullable for QR
  qr_token text,     -- New column for QR token
  expires_at timestamp with time zone not null,
  is_active boolean default true,
  records jsonb not null, -- Stores array of record IDs
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Enable RLS on 'grants' table
alter table grants enable row level security;

-- 8. Create policies for 'grants' table
-- Allow users to create grants (share records)
create policy "Users can create grants"
  on grants for insert
  with check (auth.uid() = patient_id);

-- Allow users to view their own grants
create policy "Users can view their own grants"
  on grants for select
  using (auth.uid() = patient_id);

-- 9. Create the 'access_logs' table
create table if not exists access_logs (
  id uuid default gen_random_uuid() primary key,
  grant_id uuid references grants(id) not null,
  doctor_id text, -- Optional identifier for the doctor
  record_id uuid references records(id) not null,
  accessed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Enable RLS on 'access_logs' table
alter table access_logs enable row level security;

-- 11. Create policies for 'access_logs' table
drop policy if exists "Users can view logs for their records" on access_logs;

-- Allow users to view logs for their records (via grants)
create policy "Users can view logs for their records"
  on access_logs for select
  using (
    exists (
      select 1 from grants
      where grants.id = access_logs.grant_id
      and grants.patient_id = auth.uid()
    )
  );
