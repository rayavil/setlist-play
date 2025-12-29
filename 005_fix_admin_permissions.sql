-- Allow Admins to update ANY profile (needed for Approval)
-- We use a subquery to check if the executing user has the 'admin' role.
-- Since the SELECT policy on profiles is "using (true)", this subquery is safe from infinite recursion.

CREATE POLICY "Admins can update any profile" 
ON profiles 
FOR UPDATE 
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
