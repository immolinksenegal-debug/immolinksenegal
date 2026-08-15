CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

SELECT cron.unschedule('notify-expired-packs') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'notify-expired-packs'
);

SELECT cron.schedule(
  'notify-expired-packs',
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://uccblgllyezbfsubfqin.supabase.co/functions/v1/notify-expired-packs',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjY2JsZ2xseWV6YmZzdWJmcWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNzY0NTIsImV4cCI6MjA3NTg1MjQ1Mn0.QXx6EhXfChMzjKajjulaPxYU_L1vWfHDK1_VCJtxLAE"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);