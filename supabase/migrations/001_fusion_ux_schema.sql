-- ============================================================
-- FUSION UX — Complete Database Schema
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text,
  avatar_url    text,
  job_title     text,
  timezone      text default 'UTC',
  preferences   jsonb not null default '{}',
  onboarded     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- AUDITS
-- ============================================================
create table if not exists audits (
  id                  uuid primary key default uuid_generate_v4(),
  created_by          uuid not null references auth.users(id) on delete cascade,
  name                text not null,
  description         text,
  status              text not null default 'draft'
                        check (status in ('draft','in_progress','ai_analyzing','review','completed','archived')),
  audit_type          text not null default 'image'
                        check (audit_type in ('url','image','full')),
  target_url          text,
  device_type         text not null default 'desktop',
  overall_score       integer check (overall_score between 0 and 100),
  heuristic_score     integer check (heuristic_score between 0 and 100),
  accessibility_score integer check (accessibility_score between 0 and 100),
  ai_summary          text,
  findings_count      integer not null default 0,
  critical_count      integer not null default 0,
  high_count          integer not null default 0,
  medium_count        integer not null default 0,
  low_count           integer not null default 0,
  started_at          timestamptz,
  completed_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_audits_created_by on audits(created_by);
create index if not exists idx_audits_status on audits(status);
create index if not exists idx_audits_created_at on audits(created_at desc);

-- ============================================================
-- AUDIT SCREENSHOTS
-- ============================================================
create table if not exists audit_screenshots (
  id          uuid primary key default uuid_generate_v4(),
  audit_id    uuid not null references audits(id) on delete cascade,
  url         text not null,
  filename    text not null,
  file_size   integer,
  order_index integer not null default 0,
  annotations jsonb not null default '[]',
  created_at  timestamptz not null default now()
);

create index if not exists idx_screenshots_audit on audit_screenshots(audit_id);

-- ============================================================
-- FINDINGS
-- ============================================================
create table if not exists findings (
  id                  uuid primary key default uuid_generate_v4(),
  audit_id            uuid not null references audits(id) on delete cascade,
  screenshot_id       uuid references audit_screenshots(id) on delete set null,
  created_by          uuid not null references auth.users(id),
  assigned_to         uuid references auth.users(id),
  title               text not null,
  description         text,
  severity            text not null default 'medium'
                        check (severity in ('critical','high','medium','low')),
  status              text not null default 'open'
                        check (status in ('open','in_progress','resolved','ignored')),
  verification_status text not null default 'pending'
                        check (verification_status in ('pending','verified','edited','rejected')),
  heuristic_category  text,
  heuristic_item_id   text,
  location            text,
  impact_score        integer check (impact_score between 1 and 5),
  frequency_score     integer check (frequency_score between 1 and 5),
  priority_score      integer generated always as (
                        coalesce(impact_score, 1) * coalesce(frequency_score, 1)
                      ) stored,
  ai_generated        boolean not null default false,
  ai_suggestion       text,
  business_impact     text,
  financial_risk      text,
  tags                text[] not null default '{}',
  human_notes         text,
  resolved_at         timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_findings_audit on findings(audit_id);
create index if not exists idx_findings_severity on findings(severity);
create index if not exists idx_findings_status on findings(status);
create index if not exists idx_findings_verification on findings(verification_status);

-- ============================================================
-- REPORTS
-- ============================================================
create table if not exists reports (
  id          uuid primary key default uuid_generate_v4(),
  audit_id    uuid not null references audits(id) on delete cascade,
  created_by  uuid not null references auth.users(id),
  name        text not null,
  status      text not null default 'generating'
                check (status in ('generating','ready','failed')),
  file_url    text,
  config      jsonb not null default '{}',
  ai_summary  text,
  generated_at timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists idx_reports_audit on reports(audit_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$ begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_audits_updated_at'
  ) then
    create trigger trg_audits_updated_at
    before update on audits
    for each row execute function update_updated_at_column();
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_findings_updated_at'
  ) then
    create trigger trg_findings_updated_at
    before update on findings
    for each row execute function update_updated_at_column();
  end if;
end $$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table audits enable row level security;
alter table audit_screenshots enable row level security;
alter table findings enable row level security;
alter table reports enable row level security;

-- Profiles
create policy "profiles_select_own" on profiles for select using (id = auth.uid());
create policy "profiles_update_own" on profiles for update using (id = auth.uid());
create policy "profiles_insert_own" on profiles for insert with check (id = auth.uid());

-- Audits
create policy "audits_all_own" on audits for all using (created_by = auth.uid());

-- Screenshots
create policy "screenshots_select_own" on audit_screenshots for select
  using (exists (select 1 from audits where id = audit_id and created_by = auth.uid()));
create policy "screenshots_insert_own" on audit_screenshots for insert
  with check (exists (select 1 from audits where id = audit_id and created_by = auth.uid()));
create policy "screenshots_delete_own" on audit_screenshots for delete
  using (exists (select 1 from audits where id = audit_id and created_by = auth.uid()));

-- Findings
create policy "findings_all_own" on findings for all
  using (exists (select 1 from audits where id = audit_id and created_by = auth.uid()));

-- Reports
create policy "reports_all_own" on reports for all using (created_by = auth.uid());

-- ============================================================
-- STORAGE BUCKET (run separately if CLI not used)
-- ============================================================
-- In Supabase Dashboard → Storage → Create bucket:
-- Name: audit-screenshots
-- Public: true
-- File size limit: 10MB
-- Allowed MIME types: image/png, image/jpeg, image/webp, image/gif
