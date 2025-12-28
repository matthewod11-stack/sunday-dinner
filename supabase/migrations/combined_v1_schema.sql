-- =============================================================================
-- Sunday Dinner v1 - Combined Database Schema
-- =============================================================================
-- This file combines all migrations for easy application via Supabase Dashboard
-- Run this in: Dashboard > SQL Editor > New Query
-- =============================================================================


-- =============================================================================
-- 1. EXTENSIONS AND SETUP
-- =============================================================================

-- Using gen_random_uuid() which is built into Supabase (pgcrypto)
-- No extension needed


-- =============================================================================
-- 2. ENUMS
-- =============================================================================

-- Recipe source types
create type recipe_source_type as enum ('photo', 'url', 'pdf', 'manual');

-- Meal status
create type meal_status as enum (
  'planning',
  'timeline_generated',
  'shopping_ready',
  'cooking',
  'complete'
);

-- Task status
create type task_status as enum ('pending', 'in_progress', 'completed', 'skipped');


-- =============================================================================
-- 3. UPDATED_AT TRIGGER FUNCTION
-- =============================================================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


-- =============================================================================
-- 4. RECIPES TABLE
-- =============================================================================

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  source_type recipe_source_type,
  source text,
  source_image_url text,
  serving_size integer not null check (serving_size > 0),
  prep_time_minutes integer check (prep_time_minutes >= 0),
  cook_time_minutes integer check (cook_time_minutes >= 0),
  ingredients jsonb not null default '[]'::jsonb,
  instructions jsonb not null default '[]'::jsonb,
  notes text,
  uncertain_fields text[] default '{}',
  extraction_confidence jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger recipes_updated_at
  before update on recipes
  for each row execute function update_updated_at_column();

create index idx_recipes_name on recipes(name);
create index idx_recipes_created_at on recipes(created_at desc);
create index idx_recipes_source_type on recipes(source_type);


-- =============================================================================
-- 5. MEALS TABLE
-- =============================================================================

create table if not exists meals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  serve_time timestamptz not null,
  guest_count jsonb not null default '{"total": 1}'::jsonb,
  status meal_status not null default 'planning',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger meals_updated_at
  before update on meals
  for each row execute function update_updated_at_column();

create index idx_meals_serve_time on meals(serve_time);
create index idx_meals_status on meals(status);
create index idx_meals_created_at on meals(created_at desc);


-- =============================================================================
-- 6. MEAL_RECIPES JUNCTION TABLE
-- =============================================================================

create table if not exists meal_recipes (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references meals(id) on delete cascade,
  recipe_id uuid not null references recipes(id) on delete restrict,
  original_serving_size integer not null check (original_serving_size > 0),
  target_serving_size integer not null check (target_serving_size > 0),
  multiplier numeric(10, 4) not null check (multiplier > 0),
  claude_review_notes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(meal_id, recipe_id)
);

create index idx_meal_recipes_meal_id on meal_recipes(meal_id);
create index idx_meal_recipes_recipe_id on meal_recipes(recipe_id);


-- =============================================================================
-- 7. TIMELINES TABLE
-- =============================================================================

create table if not exists timelines (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references meals(id) on delete cascade,
  has_conflicts boolean not null default false,
  conflicts jsonb not null default '[]'::jsonb,
  is_running boolean not null default false,
  started_at timestamptz,
  current_task_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(meal_id)
);

create trigger timelines_updated_at
  before update on timelines
  for each row execute function update_updated_at_column();

create index idx_timelines_meal_id on timelines(meal_id);
create index idx_timelines_is_running on timelines(is_running) where is_running = true;


-- =============================================================================
-- 8. TASKS TABLE
-- =============================================================================

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  timeline_id uuid not null references timelines(id) on delete cascade,
  meal_id uuid not null references meals(id) on delete cascade,
  recipe_id uuid not null references recipes(id) on delete restrict,
  instruction_id uuid,
  title text not null,
  description text,
  start_time_minutes integer not null,
  duration_minutes integer not null check (duration_minutes > 0),
  end_time_minutes integer not null,
  requires_oven boolean not null default false,
  oven_temp integer check (oven_temp > 0 or oven_temp is null),
  depends_on uuid[] default '{}',
  status task_status not null default 'pending',
  completed_at timestamptz,
  notes text,
  is_valid boolean default true,
  validation_errors text[] default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tasks_updated_at
  before update on tasks
  for each row execute function update_updated_at_column();

create index idx_tasks_timeline_id on tasks(timeline_id);
create index idx_tasks_meal_id on tasks(meal_id);
create index idx_tasks_recipe_id on tasks(recipe_id);
create index idx_tasks_status on tasks(status);
create index idx_tasks_start_time on tasks(start_time_minutes);
create index idx_tasks_sort_order on tasks(timeline_id, sort_order);
create index idx_tasks_oven on tasks(timeline_id, start_time_minutes, end_time_minutes)
  where requires_oven = true;

-- Add FK for current_task_id after tasks table exists
alter table timelines
  add constraint fk_timelines_current_task
  foreign key (current_task_id) references tasks(id) on delete set null;


-- =============================================================================
-- 9. ROW LEVEL SECURITY
-- =============================================================================

alter table recipes enable row level security;
alter table meals enable row level security;
alter table meal_recipes enable row level security;
alter table timelines enable row level security;
alter table tasks enable row level security;

-- Recipes
create policy "recipes_select_all" on recipes for select using (true);
create policy "recipes_insert_all" on recipes for insert with check (true);
create policy "recipes_update_all" on recipes for update using (true) with check (true);
create policy "recipes_delete_all" on recipes for delete using (true);

-- Meals
create policy "meals_select_all" on meals for select using (true);
create policy "meals_insert_all" on meals for insert with check (true);
create policy "meals_update_all" on meals for update using (true) with check (true);
create policy "meals_delete_all" on meals for delete using (true);

-- Meal Recipes
create policy "meal_recipes_select_all" on meal_recipes for select using (true);
create policy "meal_recipes_insert_all" on meal_recipes for insert with check (true);
create policy "meal_recipes_update_all" on meal_recipes for update using (true) with check (true);
create policy "meal_recipes_delete_all" on meal_recipes for delete using (true);

-- Timelines
create policy "timelines_select_all" on timelines for select using (true);
create policy "timelines_insert_all" on timelines for insert with check (true);
create policy "timelines_update_all" on timelines for update using (true) with check (true);
create policy "timelines_delete_all" on timelines for delete using (true);

-- Tasks
create policy "tasks_select_all" on tasks for select using (true);
create policy "tasks_insert_all" on tasks for insert with check (true);
create policy "tasks_update_all" on tasks for update using (true) with check (true);
create policy "tasks_delete_all" on tasks for delete using (true);


-- =============================================================================
-- 10. STORAGE BUCKET
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recipe-images',
  'recipe-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[]
)
on conflict (id) do nothing;

-- Storage policies
create policy "recipe_images_select_all" on storage.objects
  for select using (bucket_id = 'recipe-images');
create policy "recipe_images_insert_all" on storage.objects
  for insert with check (bucket_id = 'recipe-images');
create policy "recipe_images_update_all" on storage.objects
  for update using (bucket_id = 'recipe-images') with check (bucket_id = 'recipe-images');
create policy "recipe_images_delete_all" on storage.objects
  for delete using (bucket_id = 'recipe-images');


-- =============================================================================
-- DONE!
-- =============================================================================
-- Schema created successfully.
-- Tables: recipes, meals, meal_recipes, timelines, tasks
-- Storage: recipe-images bucket
-- =============================================================================
