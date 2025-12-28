-- Migration: Create meals table and meal_recipes junction
-- Sunday Dinner v1 - Meal planning with recipe scaling

-- Create enum for meal status
create type meal_status as enum (
  'planning',           -- Still setting up recipes/guests
  'timeline_generated', -- Timeline has been created
  'shopping_ready',     -- Shopping list generated
  'cooking',            -- Live execution in progress
  'complete'            -- Meal finished
);

-- Create meals table
create table if not exists meals (
  id uuid primary key default gen_random_uuid(),

  -- Core meal info
  name text not null,
  serve_time timestamptz not null,

  -- Guest count as JSONB (allows future dietary extensions)
  -- { total: 20, dietary: ["vegetarian", "gluten-free"] }
  guest_count jsonb not null default '{"total": 1}'::jsonb,

  -- Status tracking
  status meal_status not null default 'planning',

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Apply updated_at trigger to meals
create trigger meals_updated_at
  before update on meals
  for each row
  execute function update_updated_at_column();

-- Create meal_recipes junction table (many-to-many with scaling)
create table if not exists meal_recipes (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references meals(id) on delete cascade,
  recipe_id uuid not null references recipes(id) on delete restrict,

  -- Scaling information
  original_serving_size integer not null check (original_serving_size > 0),
  target_serving_size integer not null check (target_serving_size > 0),
  multiplier numeric(10, 4) not null check (multiplier > 0),

  -- Claude's scaling review
  claude_review_notes text,
  reviewed_at timestamptz,

  -- Timestamps
  created_at timestamptz not null default now(),

  -- Prevent duplicate recipe in same meal
  unique(meal_id, recipe_id)
);

-- Create indexes for common queries
create index idx_meals_serve_time on meals(serve_time);
create index idx_meals_status on meals(status);
create index idx_meals_created_at on meals(created_at desc);

create index idx_meal_recipes_meal_id on meal_recipes(meal_id);
create index idx_meal_recipes_recipe_id on meal_recipes(recipe_id);

-- Add comments for documentation
comment on table meals is 'Meal planning events (e.g., "Thanksgiving 2025") with guest counts and serve times';
comment on column meals.guest_count is 'JSONB with total guest count and optional dietary restrictions';
comment on table meal_recipes is 'Junction table linking meals to recipes with scaling factors';
comment on column meal_recipes.multiplier is 'Calculated: target_serving_size / original_serving_size';
