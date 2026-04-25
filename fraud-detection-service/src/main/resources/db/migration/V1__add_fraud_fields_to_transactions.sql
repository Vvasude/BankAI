-- Add fraud columns when "transactions" already has rows. Hibernate "add not null" alone fails
-- for existing data; this runs before JPA and uses NOT NULL with DEFAULT in one step.
-- If the table does not exist yet (new database), this is a no-op; Hibernate will create the full table.

DO
$$
BEGIN
  IF to_regclass('public.transactions') IS NULL THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'risk_score'
  ) THEN
    ALTER TABLE public.transactions
      ADD COLUMN risk_score NUMERIC(5, 4) NOT NULL DEFAULT 0.0;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'flagged'
  ) THEN
    ALTER TABLE public.transactions
      ADD COLUMN flagged BOOLEAN NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'ai_reason'
  ) THEN
    ALTER TABLE public.transactions
      ADD COLUMN ai_reason VARCHAR(2000) NOT NULL DEFAULT ''::VARCHAR(2000);
  END IF;

  UPDATE public.transactions
  SET
    risk_score = COALESCE(risk_score, 0.0),
    flagged    = COALESCE(flagged, false),
    ai_reason  = COALESCE(ai_reason, ''::VARCHAR(2000))
  WHERE risk_score IS NULL
     OR ai_reason IS NULL
     OR flagged IS NULL;
END
$$;
