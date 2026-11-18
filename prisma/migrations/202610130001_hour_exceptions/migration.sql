CREATE TABLE business_hour_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  local_date text NOT NULL CHECK (local_date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'),
  open_minute integer NOT NULL CHECK (open_minute BETWEEN 0 AND 1439),
  close_minute integer NOT NULL CHECK (close_minute BETWEEN 0 AND 1440),
  is_closed boolean NOT NULL DEFAULT false
);
CREATE INDEX business_hour_exceptions_business_id_local_date_idx ON business_hour_exceptions(business_id, local_date);
