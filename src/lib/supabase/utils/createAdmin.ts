import { createClient } from '@supabase/supabase-js';
const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function createSuperAdmin(email: string, password: string, full_name: string) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  const id = data.user.id;
  await admin.from('profiles').insert({ id, full_name, role: 'superAdmin' });
  return data;
}

// -- створюємо користувача в users (якщо ви робите через Auth API, то потім додаєте профіль)
// INSERT INTO profiles (id, full_name, role)
// VALUES ('uuid-of-user', 'Super Admin', 'superAdmin');

// createSuperAdmin.js
// import { createClient } from '@supabase/supabase-js';
// import dotenv from 'dotenv';
// dotenv.config();

// const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// async function run() {
//   const email = process.argv[2];
//   const password = process.argv[3] || 'ChangeMe123!';
//   if (!email) { devLogger.error('usage: node createSuperAdmin.js email [password]'); process.exit(1); }

//   const { data, error } = await admin.auth.admin.createUser({
//     email,
//     password,
//     email_confirm: true,
//   });
//   if (error) throw error;
//   const id = data.user.id;
//   await admin.from('profiles').insert({ id, full_name: 'Super Admin', role: 'superAdmin' });
//   devLogger.log('created', id);
// }
// run().catch(e=>{ devLogger.error(e); process.exit(1);});
// node scripts/createSuperAdmin.js admin@example.com StrongPass!
