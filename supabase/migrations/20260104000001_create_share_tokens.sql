-- Migration: Create meal_share_tokens table
-- Sunday Dinner v1 - Share links for read-only timeline viewing
--
-- Share tokens allow family members to view the cooking timeline
-- without needing an account. Tokens expire 24 hours after serve time.

-- Create share tokens table
create table if not exists meal_share_tokens (
  -- UUID v4 token IS the primary key (clean URLs: /share/{token})
  token uuid primary key default gen_random_uuid(),

  -- Reference to the meal being shared
  meal_id uuid not null references meals(id) on delete cascade,

  -- Timestamps
  created_at timestamptz not null default now(),

  -- Pre-calculated expiration (serve_time + 24 hours)
  -- Calculated at creation time for efficient validation queries
  expires_at timestamptz not null
);

-- Index for looking up tokens by meal (for revocation)
create index idx_share_tokens_meal_id on meal_share_tokens(meal_id);

-- Index for expiration cleanup jobs
create index idx_share_tokens_expires_at on meal_share_tokens(expires_at);

-- Enable RLS
alter table meal_share_tokens enable row level security;

-- =============================================================================
-- RLS Policies
-- =============================================================================

-- Public SELECT: Anyone can read a valid, non-expired token
-- This allows share link viewers to validate their token
create policy "share_tokens_public_read"
  on meal_share_tokens for select
  using (expires_at > now());

-- Host can INSERT new tokens (via anon key for v1)
create policy "share_tokens_insert"
  on meal_share_tokens for insert
  with check (true);

-- Host can DELETE tokens (revoke links)
create policy "share_tokens_delete"
  on meal_share_tokens for delete
  using (true);

-- Add comments for documentation
comment on table meal_share_tokens is 'Share tokens for read-only timeline access. Tokens expire 24h after meal serve time.';
comment on column meal_share_tokens.token is 'UUID v4 token used in share URL: /share/{token}';
comment on column meal_share_tokens.expires_at is 'Pre-calculated expiration: serve_time + 24 hours';
