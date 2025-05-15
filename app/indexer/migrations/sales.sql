CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY NOT NULL,
    sale_id UUID NOT NULL,
    status status NOT NULL,
    end_date BIGINT NOT NULL,
    hash TEXT NOT NULL
);