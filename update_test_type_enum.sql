-- Update the test_type_enum to include all new test types
-- Run this in the Supabase SQL Editor

-- First, create a new enum with all the values
CREATE TYPE test_type_enum_new AS ENUM (
  'CBC',
  'LFT', 
  'BloodSugar',
  'Renal',
  'Lipid',
  'TFT',
  'Urine',
  'BloodGrouping',
  'Vidal',
  'Inflammatory',
  'Infectious',
  'Cardiac',
  'Coagulation',
  'Electrolytes',
  'Vitamins',
  'Tumor',
  'Pregnancy',
  'Pancreatic'
);

-- Update the column to use the new enum
ALTER TABLE test_results 
  ALTER COLUMN test_type TYPE test_type_enum_new 
  USING test_type::text::test_type_enum_new;

-- Drop the old enum
DROP TYPE test_type_enum;

-- Rename the new enum to the original name
ALTER TYPE test_type_enum_new RENAME TO test_type_enum; 