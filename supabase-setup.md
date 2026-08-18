# Підключення бази даних (Supabase) до форми на taras-it.com

Форма на сайті вже переписана — вона відправляє заявки прямо в базу даних
Supabase (замість mailto-листа). Лишилось зробити 4 кроки, які може виконати
тільки власник акаунта: створити безкоштовний проєкт і дати мені (у коді)
дві публічні настройки — URL і анон-ключ.

## Крок 1 — створити акаунт і проєкт

1. Відкрити [supabase.com](https://supabase.com) → **Start your project**.
2. Увійти через GitHub, Google або email — на вибір.
3. **New project**:
   - Name: `taras-it` (або будь-яка назва)
   - Database Password: натиснути "Generate a password" і **зберегти його** (знадобиться рідко, але знадобиться)
   - Region: найближчий до відвідувачів сайту, напр. `East US (North Virginia)`
   - Pricing Plan: **Free**
4. Натиснути **Create new project** і зачекати ~2 хвилини, поки проєкт підніметься.

## Крок 2 — створити таблицю `leads`

1. У лівому меню відкрити **SQL Editor** → **New query**.
2. Вставити цей SQL повністю і натиснути **Run**:

```sql
create table public.leads (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null,
  contact text not null,
  channel text,
  message text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  page_url text
);

alter table public.leads enable row level security;

create policy "Allow anonymous insert only"
on public.leads
for insert
to anon
with check (true);
```

Це створює таблицю з полями, які ти просив (ім'я, контакт, канал зв'язку, текст
запиту, дата/час — `created_at` заповнюється автоматично), плюс UTM-мітки, щоб
одразу бачити джерело кожного ліда.

Рядок `enable row level security` + `create policy ... for insert` означає:
публічний ключ сайту може **тільки додавати** нові рядки. Він не може
читати, редагувати чи видаляти чужі заявки — навіть якщо хтось побачить цей
ключ у коді сторінки, доступу до вже збережених даних він не отримає.

3. Перевірити: у лівому меню **Table Editor** → має з'явитись таблиця `leads` з
   потрібними колонками.

## Крок 3 — скопіювати URL і ключ

1. Ліве меню → **Project Settings** (шестерня) → **API**.
2. Скопіювати два значення:
   - **Project URL** (виглядає як `https://xxxxxxxx.supabase.co`)
   - **anon public** ключ (довгий рядок, це не секретний ключ — його й треба
     використати на сайті)

## Крок 4 — вставити значення в index.html

У файлі `index.html`, який я вже підготував, знайти цей блок (пошук по
`YOUR_SUPABASE_URL`):

```js
var SUPABASE_URL = 'YOUR_SUPABASE_URL'; // e.g. https://abcdefgh.supabase.co
var SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

Замінити на свої значення з Кроку 3, зберегти файл і завантажити на GitHub
разом з оновленими `styles.css` і `privacy.html`.

## Перевірка

1. Відкрити taras-it.com, прокрутити до форми внизу, заповнити тестову заявку
   і надіслати.
2. Має відкритись сторінка подяки (thank-you.html), як і раніше.
3. У Supabase → **Table Editor** → `leads` — має з'явитись новий рядок з усіма
   даними (ім'я, контакт, канал, текст запиту, дата/час, і джерело, якщо
   перейшов за UTM-посиланням).

Якщо база не відповість (немає інтернету, збій сервісу) — відвідувач
побачить повідомлення "Couldn't send — please call ... or email ... directly"
замість переходу на сторінку подяки, форма нікуди не зникне.

## Що можна зробити пізніше (не обов'язково зараз)

- **Email-сповіщення про нову заявку.** Supabase має вбудовані Database
  Webhooks — можна налаштувати миттєве повідомлення на email/Telegram при
  кожному новому рядку в `leads`, без написання коду.
- **Перегляд/фільтрація заявок.** Table Editor у Supabase вже дозволяє
  сортувати й фільтрувати — для щоденної роботи цього, скоріш за все,
  вистачить без окремої CRM.
