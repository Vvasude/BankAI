-- For empty databases: V1/V2 return early when public.transactions is missing, so
-- no tables would exist if Hibernate is not used. Hibernate is disabled; this
-- creates the full schema when tables are absent. Safe on existing DBs: IF NOT EXISTS.
CREATE TABLE IF NOT EXISTS public.users
(
    id            BIGSERIAL PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE TABLE IF NOT EXISTS public.transactions
(
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT        NOT NULL REFERENCES public.users (id),
    amount       NUMERIC(19, 2) NOT NULL,
    merchant     VARCHAR(255)  NOT NULL,
    country_code VARCHAR(2)    NOT NULL,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    risk_score   NUMERIC(5, 4) NOT NULL DEFAULT 0.0,
    flagged      BOOLEAN       NOT NULL DEFAULT false,
    ai_reason    VARCHAR(2000) NOT NULL DEFAULT ''::VARCHAR(2000)
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions (user_id);
