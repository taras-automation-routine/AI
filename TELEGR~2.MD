# Автовідповідь бота @taras_it_leads_bot

Це вже інша механіка, ніж сповіщення про заявки. Той тригер (pg_net) вміє
тільки *надсилати* повідомлення з бази — він не може *реагувати* на те, що
хтось написав боту. Щоб бот сам відповідав, потрібна невелика функція
(Supabase Edge Function), яку Telegram буде викликати щоразу, коли хтось
пише боту.

## Крок 1 — створити функцію

1. Supabase → ліве меню → **Edge Functions**.
2. **Deploy a new function** (або "Create function").
3. Назва: `telegram-webhook`.
4. Якщо відкриється редактор коду прямо в браузері — стерти весь приклад і
   вставити повністю:

```ts
Deno.serve(async (req) => {
  try {
    const update = await req.json();
    const chatId = update?.message?.chat?.id;

    if (chatId) {
      const BOT_TOKEN = '8888648728:AAGu0aU-J_l75YP5cITUpn88yANlwfK7hXM';
      const REPLY = "Thank you. Your request has been received. We'll reply within 24 hours. Have a great day.";

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: REPLY }),
      });
    }

    return new Response('ok', { status: 200 });
  } catch (e) {
    return new Response('ok', { status: 200 });
  }
});
```

5. Натиснути **Deploy** (або "Save and Deploy").

## Крок 2 — вимкнути перевірку JWT

Без цього Telegram не зможе достукатись до функції (Supabase за замовчуванням
вимагає власний токен авторизації, а Telegram його не надсилає).

1. Відкрити щойно створену функцію → вкладка з налаштуваннями (іконка
   шестерні / "Details").
2. Знайти перемикач **Enforce JWT Verification** (або "Verify JWT") →
   вимкнути → зберегти.

## Крок 3 — скопіювати URL функції

На сторінці функції має бути посилання виду:

```
https://prcdjnbxbsppfwlmwkgz.supabase.co/functions/v1/telegram-webhook
```

## Крок 4 — підключити його до бота

Відкрити в браузері (підставивши свій URL з Кроку 3):

```
https://api.telegram.org/bot8888648728:AAGu0aU-J_l75YP5cITUpn88yANlwfK7hXM/setWebhook?url=https://prcdjnbxbsppfwlmwkgz.supabase.co/functions/v1/telegram-webhook
```

Успішна відповідь виглядає так:

```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

## Перевірка

Напиши боту @taras_it_leads_bot будь-що (навіть просто "тест") — протягом
кількох секунд має прийти автовідповідь:

> Thank you. Your request has been received. We'll reply within 24 hours.
> Have a great day.

## Важливо

Після того, як встановлено webhook, бот більше не працює через `getUpdates`
(той метод, яким ми раніше діставали chat_id) — це нормально, він більше не
потрібен, бот тепер відповідає сам автоматично.
