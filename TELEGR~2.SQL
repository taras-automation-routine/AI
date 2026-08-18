create or replace function public.notify_telegram_new_lead()
returns trigger
language plpgsql
security definer
as $$
declare
  bot_token text := '8888648728:AAGu0aU-J_l75YP5cITUpn88yANlwfK7hXM';
  chat_id text := '8919544723';
  msg text;
begin
  msg :=
    '🔔 New lead — Taras IT' || chr(10) ||
    'Name: ' || coalesce(new.name, '-') || chr(10) ||
    'Contact: ' || coalesce(new.contact, '-') || chr(10) ||
    'Channel: ' || coalesce(new.channel, '-') || chr(10) ||
    'Message: ' || coalesce(new.message, '-') || chr(10) ||
    'Source: ' || coalesce(new.utm_source, 'direct') ||
      case when new.utm_campaign is not null then ' / ' || new.utm_campaign else '' end || chr(10) ||
    'Time: ' || to_char(new.created_at at time zone 'America/New_York', 'YYYY-MM-DD HH24:MI') || ' (New York)';

  perform net.http_post(
    url := 'https://api.telegram.org/bot' || bot_token || '/sendMessage',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('chat_id', chat_id, 'text', msg)
  );

  return new;
end;
$$;

drop trigger if exists trg_notify_telegram_new_lead on public.leads;

create trigger trg_notify_telegram_new_lead
after insert on public.leads
for each row
execute function public.notify_telegram_new_lead();
