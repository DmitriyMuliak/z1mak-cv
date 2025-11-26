- Quick deploy check-list

Встанови deps (pdfjs-dist, jszip, @supabase/supabase-js)

Додай env vars (див. вище)

Створи таблиці SQL у Supabase

Деплой Edge Function process-job (Supabase Functions або Vercel edge)

Налаштуй Supabase HTTP trigger → URL Edge Function + header x-worker-secret: Bearer <WORKER_SECRET>

Деплой Next.js сайт (Vercel) — переконайся, що NEXT*PUBLIC_SUPABASE*\* доступні

Тест: завантаж файл → дивись insert in jobs → webhook викликає process-job → inserts job_results → FE отримує realtime update
