-- Shopping Lists Table
-- Stores generated shopping lists for meals with consolidated ingredients

CREATE TABLE IF NOT EXISTS shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,

  -- Consolidated shopping items as JSONB array
  -- Each item: { id, name, quantity, unit, section, isStaple, sourceRecipeIds, checked, notes }
  items JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Items that couldn't be automatically reconciled
  -- Each item: { name, reason, examples, recipeIds }
  unreconcilable JSONB DEFAULT '[]'::jsonb,

  -- Summary stats (denormalized for quick access)
  total_items INTEGER DEFAULT 0,
  checked_items INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Only one shopping list per meal
  CONSTRAINT unique_meal_shopping_list UNIQUE (meal_id)
);

-- Index for meal lookups
CREATE INDEX IF NOT EXISTS idx_shopping_lists_meal_id ON shopping_lists(meal_id);

-- Trigger to update updated_at on changes
CREATE OR REPLACE FUNCTION update_shopping_lists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shopping_lists_updated_at
  BEFORE UPDATE ON shopping_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_shopping_lists_updated_at();

-- RLS Policies (permissive for v1 solo user)
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on shopping_lists"
  ON shopping_lists
  FOR ALL
  USING (true)
  WITH CHECK (true);
