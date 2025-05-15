DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status') THEN
        CREATE TYPE status AS ENUM ('Waiting', 'Failed', 'Completed', 'Closed');
    END IF;
END $$;