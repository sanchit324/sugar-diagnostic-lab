-- Add phone_number and serial_number columns to patients table
-- Run this in the Supabase SQL Editor

-- Add phone_number column
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS phone_number TEXT DEFAULT '';

-- Add serial_number column
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS serial_number TEXT DEFAULT '';

-- Update existing records to have a serial number if they don't have one
UPDATE patients 
SET serial_number = id::text 
WHERE serial_number IS NULL OR serial_number = ''; 