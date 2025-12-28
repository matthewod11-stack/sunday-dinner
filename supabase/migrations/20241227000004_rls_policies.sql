-- Migration: Row Level Security policies
-- Sunday Dinner v1 - Permissive for solo user
--
-- Strategy: For v1 single-user, we allow all operations.
-- The anon key needs read access for share link viewers (Phase 3).
-- Full auth would be added in v2 multi-user.

-- Enable RLS on all tables
alter table recipes enable row level security;
alter table meals enable row level security;
alter table meal_recipes enable row level security;
alter table timelines enable row level security;
alter table tasks enable row level security;

-- =============================================================================
-- Recipes: Full access (solo user)
-- =============================================================================

create policy "recipes_select_all"
  on recipes for select
  using (true);

create policy "recipes_insert_all"
  on recipes for insert
  with check (true);

create policy "recipes_update_all"
  on recipes for update
  using (true)
  with check (true);

create policy "recipes_delete_all"
  on recipes for delete
  using (true);

-- =============================================================================
-- Meals: Full access (solo user)
-- =============================================================================

create policy "meals_select_all"
  on meals for select
  using (true);

create policy "meals_insert_all"
  on meals for insert
  with check (true);

create policy "meals_update_all"
  on meals for update
  using (true)
  with check (true);

create policy "meals_delete_all"
  on meals for delete
  using (true);

-- =============================================================================
-- Meal Recipes: Full access (solo user)
-- =============================================================================

create policy "meal_recipes_select_all"
  on meal_recipes for select
  using (true);

create policy "meal_recipes_insert_all"
  on meal_recipes for insert
  with check (true);

create policy "meal_recipes_update_all"
  on meal_recipes for update
  using (true)
  with check (true);

create policy "meal_recipes_delete_all"
  on meal_recipes for delete
  using (true);

-- =============================================================================
-- Timelines: Full access (solo user)
-- =============================================================================

create policy "timelines_select_all"
  on timelines for select
  using (true);

create policy "timelines_insert_all"
  on timelines for insert
  with check (true);

create policy "timelines_update_all"
  on timelines for update
  using (true)
  with check (true);

create policy "timelines_delete_all"
  on timelines for delete
  using (true);

-- =============================================================================
-- Tasks: Full access (solo user)
-- =============================================================================

create policy "tasks_select_all"
  on tasks for select
  using (true);

create policy "tasks_insert_all"
  on tasks for insert
  with check (true);

create policy "tasks_update_all"
  on tasks for update
  using (true)
  with check (true);

create policy "tasks_delete_all"
  on tasks for delete
  using (true);

-- =============================================================================
-- Comments for future reference
-- =============================================================================

comment on policy "recipes_select_all" on recipes is
  'v1: Allow all reads. v2: Restrict to owner via user_id column.';

comment on policy "meals_select_all" on meals is
  'v1: Allow all reads. v2: Restrict to owner or share token holders.';
