CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.email_otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    purpose TEXT NOT NULL DEFAULT 'email_login',
    otp_code TEXT NOT NULL,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    verified_at TIMESTAMP WITH TIME ZONE,
    consumed_at TIMESTAMP WITH TIME ZONE
);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'email_otp_codes'
          AND column_name = 'code_hash'
    ) THEN
        ALTER TABLE public.email_otp_codes RENAME COLUMN code_hash TO otp_code;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_email_otp_codes_lookup
ON public.email_otp_codes(email, purpose, created_at DESC);

ALTER TABLE public.email_otp_codes ENABLE ROW LEVEL SECURITY;
