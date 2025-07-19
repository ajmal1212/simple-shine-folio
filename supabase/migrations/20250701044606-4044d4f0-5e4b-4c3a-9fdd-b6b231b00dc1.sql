
-- Temporarily disable the trigger to allow manual user creation in Supabase
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Also add a policy to allow inserts into profiles (for manual profile creation)
CREATE POLICY "Allow profile creation" ON profiles
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);
