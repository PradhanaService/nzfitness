CREATE UNIQUE INDEX IF NOT EXISTS idx_offline_members_email_unique
ON public.offline_members (lower(email))
WHERE email IS NOT NULL;
