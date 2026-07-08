-- Fix schema qualification issue in generate_warehouse_code() when called by supabase_auth_admin
CREATE OR REPLACE FUNCTION public.generate_warehouse_code()
RETURNS text AS $$
DECLARE
  code text;
  attempts int := 0;
BEGIN
  LOOP
    -- Generate a random 4-digit number between 1000 and 9999
    code := (floor(random() * 9000) + 1000)::int::text;
    -- Ensure uniqueness across profiles (using schema qualification public.profiles)
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE warehouse_code = code);
    attempts := attempts + 1;
    IF attempts > 200 THEN
      RAISE EXCEPTION 'Could not generate a unique 4-digit warehouse code after 200 attempts';
    END IF;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;
