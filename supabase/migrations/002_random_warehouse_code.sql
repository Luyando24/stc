-- ── Warehouse code: Random 4-digit (1000-9999, unique) ─────────────────────
-- Drop the old sequential approach and replace with a random unique code generator

CREATE OR REPLACE FUNCTION generate_warehouse_code()
RETURNS text AS $$
DECLARE
  code text;
  attempts int := 0;
BEGIN
  LOOP
    -- Generate a random 4-digit number between 1000 and 9999
    code := (floor(random() * 9000) + 1000)::int::text;
    -- Ensure uniqueness across profiles
    EXIT WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE warehouse_code = code);
    attempts := attempts + 1;
    IF attempts > 200 THEN
      RAISE EXCEPTION 'Could not generate a unique 4-digit warehouse code after 200 attempts';
    END IF;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Regenerate warehouse codes for all existing users (one at a time to ensure uniqueness)
DO $$
DECLARE
  r RECORD;
  new_code text;
  attempts int;
BEGIN
  FOR r IN SELECT id FROM profiles WHERE warehouse_code IS NOT NULL ORDER BY created_at LOOP
    attempts := 0;
    LOOP
      new_code := (floor(random() * 9000) + 1000)::int::text;
      EXIT WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE warehouse_code = new_code);
      attempts := attempts + 1;
      IF attempts > 200 THEN
        RAISE EXCEPTION 'Could not find unique code for user %', r.id;
      END IF;
    END LOOP;
    UPDATE profiles SET warehouse_code = new_code WHERE id = r.id;
  END LOOP;
END;
$$;
