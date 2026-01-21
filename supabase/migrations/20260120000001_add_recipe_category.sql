-- Migration: Add category column to recipes table
-- Phase 3.5A: Auto-derived categories for recipe organization

-- Create enum for recipe categories
create type recipe_category as enum (
  'main-dish',
  'side-dish',
  'appetizer',
  'dessert',
  'bread',
  'salad',
  'soup',
  'beverage',
  'other'
);

-- Add category column to recipes table
alter table recipes
  add column category recipe_category default 'other';

-- Create index for category filtering
create index idx_recipes_category on recipes(category);

-- Add comment for documentation
comment on column recipes.category is 'Recipe category for organization (AI-suggested or user-selected)';
