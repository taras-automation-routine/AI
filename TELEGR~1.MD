# Сповіщення в Telegram про нову заявку

Все робиться всередині Supabase (SQL Editor) — без Edge Functions, без CLI,
без будь-яких змін у файлах сайту. Коли в таблицю `leads` додається новий
рядок, база сама надсилає повідомлення в @it_tom_lviv.

## Крок 1 — створити Telegram-бота

1. У Telegram відкрити **@BotFather**.
2. Написати `/newbot`, дати боту ім'я і username (напр. `taras_it_leads_bot`).
3. BotFather видасть **токен** виду `123456789:AAExampleTokenHere` — скопіювати
   і зберегти, він знадобиться в Кроці 4.

## Крок 2 — додати бота адміном у канал

1. Відкрити канал **@it_tom_lviv** → Manage Channel → Administrators →
   Add Administrator.
2. Знайти бота за username, який дав йому BotFather.
3. Увімкнути щонайменше право **Post Messages**, зберегти.

Без цього кроку бот не зможе писати в канал — Telegram вимагає адмін-прав
для будь-якого бота в каналі (на відміну від груп).

## Крок 3 — увімкнути pg_net

1. У Supabase: ліве меню → **Database** → **Extensions**.
2. Знайти в пошуку `pg_net` → натиснути **Enable** (якщо вже увімкнено —
   нічого робити не треба, йти далі).

`pg_net` — це розширення, яке дозволяє Postgres самому робити HTTP-запити
(без нього база не змогла б "достукатись" до Telegram).

## Крок 4 — тригер у SQL Editor

**SQL Editor → New query**, вставити повністю, замінивши
`PASTE_YOUR_BOT_TOKEN_HERE` на токен з Кроку 1, і натиснути **Run**:

```sql
create or replace function public.notify_telegram_new_lead()
returns trigger
language plpgsql
security definer
as $$
declare
  bot_token text := 'PASTE_YOUR_BOT_TOKEN_HERE';
  chat_id text := '@it_tom_lviv';
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

create trigger trg_notify_telegram_new_lead
after insert on public.leads
for each row
execute function public.notify_telegram_new_lead();
```

Токен зберігається тільки всередині цієї функції в базі — у коді сайту
(`index.html`) він ніде не з'являється і клієнту не видно.

## Перевірка

Заповнити тестову заявку на сайті → протягом кількох секунд у @it_tom_lviv
має прийти повідомлення з ім'ям, контактом, каналом, текстом запиту і
джерелом (якщо перехід був за UTM-посиланням).

## Якщо захочеш згодом змінити канал/токен

Просто заново виконати блок `create or replace function ...` з новим
значенням `bot_token` або `chat_id` — тригер підхопить зміну автоматично,
нічого пересоздавати не треба.
