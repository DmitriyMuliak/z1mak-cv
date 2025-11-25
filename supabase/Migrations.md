Інструкції — як працювати з цими міграціями локально (коротко)

Встанови Supabase CLI:

npm install -g supabase


Ініціалізуй проект (раз):

supabase init


Помісти SQL файли в supabase/migrations/ (як я дав вище). Іменування — YYYYMMDD_NNN_description.sql або YYYYMMDD_HHMMSS_description.sql — зручніше відслідковувати порядок.

Запусти локальний Supabase (підніме Postgres):

supabase start


Прогнать міграції:

supabase db push


або, щоб створити окрему міграцію на основі змін:

supabase migration new add_jobs_table


Чи зберігати оригінальні DDL/скрипти? — Так.
Рекомендація:

Зберігай міграції в supabase/migrations/.

Зберігай “source” DDL в db/schema/ або db/tables/ як ідентифікований, читабельний SQL (повна структура). Міграції — це історія змін; schema — "джерело істини".

Файли в db/schema/ можна назвати логічно: jobs.sql, job_results.sql.