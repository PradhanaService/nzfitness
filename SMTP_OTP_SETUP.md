# Gmail SMTP OTP Setup

This project now supports email OTP through Gmail SMTP using Supabase Edge Functions.

## 1. Create a Gmail App Password

1. Log in to the Gmail account you want to send OTPs from.
2. Enable 2-Step Verification on that Google account.
3. Open Google Account -> Security -> App passwords.
4. Create a new app password and copy the 16-character value.

## 2. Run the SQL

Run [SMTP_OTP_SCHEMA.sql](C:\Users\ADMIN\Downloads\noize_gym-main (1)\noize_gym-main\SMTP_OTP_SCHEMA.sql) in your Supabase SQL Editor.

## 3. Set Supabase function secrets

Add these secrets in Supabase:

```bash
supabase secrets set SMTP_GMAIL_USER="yourgmail@gmail.com"
supabase secrets set SMTP_GMAIL_APP_PASSWORD="your-16-char-app-password"
supabase secrets set SMTP_FROM_NAME="NOIZE Fitness"
```

## 4. Deploy the functions

```bash
supabase functions deploy send-email-otp
supabase functions deploy verify-email-otp
```

## 5. Frontend behavior

- `supabase.auth.signInWithOtp({ email })` now sends a Gmail SMTP OTP.
- `supabase.auth.verifyOtp({ email, token, type: 'email' })` now verifies against the custom OTP table.
- Admin email/password login and Firebase phone OTP are unchanged.

## Notes

- OTP expiry is 10 minutes.
- Resend cooldown is 60 seconds.
- Wrong OTP attempts are capped server-side.
