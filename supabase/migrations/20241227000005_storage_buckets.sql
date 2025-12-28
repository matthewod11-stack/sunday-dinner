-- Migration: Create storage buckets
-- Sunday Dinner v1 - Recipe image storage

-- =============================================================================
-- Create recipe-images bucket
-- =============================================================================

-- Insert bucket if it doesn't exist
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recipe-images',
  'recipe-images',
  true,  -- Public bucket for easy image display
  5242880,  -- 5MB limit (images are compressed client-side to <500KB target)
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[]
)
on conflict (id) do nothing;

-- =============================================================================
-- Storage policies for recipe-images bucket
-- =============================================================================

-- Allow anyone to read images (needed for viewing recipes)
create policy "recipe_images_select_all"
  on storage.objects for select
  using (bucket_id = 'recipe-images');

-- Allow anyone to upload images (v1 solo user)
create policy "recipe_images_insert_all"
  on storage.objects for insert
  with check (bucket_id = 'recipe-images');

-- Allow anyone to update their uploads (v1 solo user)
create policy "recipe_images_update_all"
  on storage.objects for update
  using (bucket_id = 'recipe-images')
  with check (bucket_id = 'recipe-images');

-- Allow anyone to delete their uploads (v1 solo user)
create policy "recipe_images_delete_all"
  on storage.objects for delete
  using (bucket_id = 'recipe-images');

-- Comments on storage policies require owner privileges
-- Skipping comments for storage.objects policies
