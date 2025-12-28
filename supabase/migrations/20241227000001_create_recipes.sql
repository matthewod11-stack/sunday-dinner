-- Migration: Create recipes table
-- Sunday Dinner v1 - Recipe storage with JSONB for ingredients/instructions

-- Create enum for recipe source types
create type recipe_source_type as enum ('photo', 'url', 'pdf', 'manual');

-- Create recipes table
-- Using gen_random_uuid() which is built into Supabase (pgcrypto)
create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),

  -- Core recipe info
  name text not null,
  description text,

  -- Source tracking
  source_type recipe_source_type,
  source text,  -- URL, "Handwritten card", etc.
  source_image_url text,  -- Supabase Storage URL

  -- Serving and timing
  serving_size integer not null check (serving_size > 0),
  prep_time_minutes integer check (prep_time_minutes >= 0),
  cook_time_minutes integer check (cook_time_minutes >= 0),

  -- Ingredients as JSONB array
  -- Each: { id, name, quantity, unit, notes }
  ingredients jsonb not null default '[]'::jsonb,

  -- Instructions as JSONB array
  -- Each: { id, stepNumber, description, durationMinutes, ovenRequired, ovenTemp, notes }
  instructions jsonb not null default '[]'::jsonb,

  -- General notes
  notes text,

  -- Extraction metadata (for correction UI)
  uncertain_fields text[] default '{}',
  extraction_confidence jsonb,  -- { "name": 0.95, "ingredients": 0.8, ... }

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create updated_at trigger function (reusable)
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at trigger to recipes
create trigger recipes_updated_at
  before update on recipes
  for each row
  execute function update_updated_at_column();

-- Create indexes for common queries
create index idx_recipes_name on recipes(name);
create index idx_recipes_created_at on recipes(created_at desc);
create index idx_recipes_source_type on recipes(source_type);

-- Add comment for documentation
comment on table recipes is 'Recipe storage for Sunday Dinner - supports photo, URL, PDF, and manual ingestion';
comment on column recipes.ingredients is 'JSONB array of ingredients: [{id, name, quantity, unit, notes}]';
comment on column recipes.instructions is 'JSONB array of instructions: [{id, stepNumber, description, durationMinutes, ovenRequired, ovenTemp, notes}]';
comment on column recipes.uncertain_fields is 'Fields that need user review during extraction correction';
