-- 002 — review detail + per-repo settings
-- Run after 001_init.sql

-- Add findings JSONB column so the dashboard can show review detail.
alter table public.reviews
  add column if not exists findings jsonb default '[]'::jsonb,
  add column if not exists pr_url text,
  add column if not exists pr_title text;

create index if not exists reviews_findings_count_idx on public.reviews ((findings_count));

-- Per-repo / per-installation settings.
create table if not exists public.repo_settings (
  installation_id bigint not null,
  repo            text not null,                                -- "owner/name"
  skip_paths      text[] default '{}',                          -- glob patterns to skip
  min_severity    text not null default 'info'
                  check (min_severity in ('info','warn','error')),
  extra_prompt    text default '',                              -- prepended to system prompt
  enabled         boolean not null default true,
  updated_at      timestamptz not null default now(),
  primary key (installation_id, repo)
);

create index if not exists repo_settings_repo_idx on public.repo_settings (repo);

alter table public.repo_settings enable row level security;

drop policy if exists "repo_settings_select_own" on public.repo_settings;
create policy "repo_settings_select_own"
  on public.repo_settings for select
  using (
    installation_id in (
      select id from public.installations where user_id = auth.uid()
    )
  );

drop policy if exists "repo_settings_modify_own" on public.repo_settings;
create policy "repo_settings_modify_own"
  on public.repo_settings for all
  using (
    installation_id in (
      select id from public.installations where user_id = auth.uid()
    )
  )
  with check (
    installation_id in (
      select id from public.installations where user_id = auth.uid()
    )
  );
