
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create a security definer function to check user role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create new policies using the security definer function
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT 
  TO authenticated
  USING (
    auth.uid() = id OR 
    get_current_user_role() = 'admin'
  );

CREATE POLICY "Admins can insert profiles" ON profiles
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    auth.uid() = id OR 
    get_current_user_role() = 'admin'
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE 
  TO authenticated
  USING (
    auth.uid() = id OR 
    get_current_user_role() = 'admin'
  );

-- Also allow the trigger function to insert profiles by temporarily disabling RLS during user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Check if this is the first user (make them admin)
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- Insert with elevated privileges to bypass RLS during user creation
  PERFORM set_config('row_security', 'off', true);
  
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'agent'::user_role END
  );
  
  PERFORM set_config('row_security', 'on', true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
