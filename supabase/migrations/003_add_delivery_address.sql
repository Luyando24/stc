-- Add delivery_address column to profiles table for storing customer receiver addresses outside China
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS delivery_address text;
