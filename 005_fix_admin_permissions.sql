-- Fix admin permissions to allow both admin and super_admin roles
-- Run this in Supabase SQL Editor

-- Drop old policy if exists
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- Create new policy that allows admin OR super_admin to update any profile
CREATE POLICY "Admins can update any profile" 
ON profiles 
FOR UPDATE 
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
);

-- Also ensure there's a policy for admins to DELETE profiles
DROP POLICY IF EXISTS "Admins can delete any profile" ON profiles;
CREATE POLICY "Admins can delete any profile" 
ON profiles 
FOR DELETE 
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
);
