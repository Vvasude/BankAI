-- Audit trail for explainable decisions (Supabase/Postgres)

CREATE TABLE IF NOT EXISTS public.audit_logs
(
    id              BIGSERIAL PRIMARY KEY,
    transaction_id  BIGINT        NOT NULL REFERENCES public.transactions (id) ON DELETE CASCADE,
    user_id         BIGINT        NOT NULL REFERENCES public.users (id),
    model           VARCHAR(128)  NOT NULL,
    rule_name       VARCHAR(64)   NOT NULL,
    message         VARCHAR(2000) NOT NULL,
    risk_contribution NUMERIC(5, 4),
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tx_created_at
    ON public.audit_logs (transaction_id, created_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created_at
    ON public.audit_logs (user_id, created_at);
