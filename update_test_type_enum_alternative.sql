-- Alternative approach to update test_type_enum
-- Run this in the Supabase SQL Editor

-- Add new enum values one by one
ALTER TYPE test_type_enum ADD VALUE IF NOT EXISTS 'BloodGrouping';
ALTER TYPE test_type_enum ADD VALUE IF NOT EXISTS 'Vidal';
ALTER TYPE test_type_enum ADD VALUE IF NOT EXISTS 'Inflammatory';
ALTER TYPE test_type_enum ADD VALUE IF NOT EXISTS 'Infectious';
ALTER TYPE test_type_enum ADD VALUE IF NOT EXISTS 'Cardiac';
ALTER TYPE test_type_enum ADD VALUE IF NOT EXISTS 'Coagulation';
ALTER TYPE test_type_enum ADD VALUE IF NOT EXISTS 'Electrolytes';
ALTER TYPE test_type_enum ADD VALUE IF NOT EXISTS 'Vitamins';
ALTER TYPE test_type_enum ADD VALUE IF NOT EXISTS 'Tumor';
ALTER TYPE test_type_enum ADD VALUE IF NOT EXISTS 'Pregnancy';
ALTER TYPE test_type_enum ADD VALUE IF NOT EXISTS 'Pancreatic'; 