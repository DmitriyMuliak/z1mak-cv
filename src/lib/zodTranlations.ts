// ✅ Крок 1. Створи словник помилок у messages

// (наприклад messages/uk.json і messages/en.json)

// // messages/uk.json
// {
//   "Zod": {
//     "required": "Обов'язкове поле",
//     "invalid_type": "Неправильний тип даних",
//     "too_small": "Занадто коротке значення (мінімум {min})",
//     "email": "Некоректний email"
//   }
// }

// ✅ Крок 2. Створи helper для локалізації помилок Zod
// // lib/zodLocalization.ts
// import { z, ZodErrorMap } from 'zod';
// import { getTranslations } from 'next-intl/server';

// export const createLocalizedZodErrorMap = async () => {
//   const t = await getTranslations('Zod');

//   const errorMap: ZodErrorMap = (issue, ctx) => {
//     switch (issue.code) {
//       case z.ZodIssueCode.invalid_type:
//         return { message: t('invalid_type') };
//       case z.ZodIssueCode.too_small:
//         return { message: t('too_small', { min: issue.minimum }) };
//       case z.ZodIssueCode.invalid_string:
//         if (issue.validation === 'email') {
//           return { message: t('email') };
//         }
//         break;
//       case z.ZodIssueCode.custom:
//         return { message: issue.message ?? t('required') };
//       case z.ZodIssueCode.invalid_literal:
//       case z.ZodIssueCode.invalid_enum_value:
//       case z.ZodIssueCode.unrecognized_keys:
//       case z.ZodIssueCode.invalid_union:
//       case z.ZodIssueCode.invalid_union_discriminator:
//       case z.ZodIssueCode.invalid_date:
//       case z.ZodIssueCode.invalid_intersection_types:
//       case z.ZodIssueCode.not_multiple_of:
//       default:
//         return { message: t('required') };
//     }

//     return { message: ctx.defaultError };
//   };

//   return errorMap;
// };

// ✅ Крок 3. Використай цей errorMap у схемі
// // example usage inside server component or API
// import { z } from 'zod';
// import { createLocalizedZodErrorMap } from '@/lib/zodLocalization';

// export const getSchema = async () => {
//   const errorMap = await createLocalizedZodErrorMap();

//   z.setErrorMap(errorMap);

//   return z.object({
//     email: z.string().email(),
//     password: z.string().min(6),
//   });
// };

// ✅ Крок 4. Використання у Form (React Hook Form + zodResolver)
// 'use client';

// import { useTranslations } from 'next-intl';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useForm } from 'react-hook-form';
// import { z } from 'zod';

// export function LoginForm() {
//   const t = useTranslations('Zod');

//   const schema = z.object({
//     email: z.string().email(t('email')),
//     password: z.string().min(6, t('too_small', { min: 6 })),
//   });

//   const form = useForm({
//     resolver: zodResolver(schema),
//   });

//   // form rendering ...
// }

// 💬 Альтернатива: автоматична інтеграція

// Якщо ти хочеш, щоб усі схеми автоматично використовували локалізацію, просто в app/[locale]/layout.tsx виклич:

// import { z } from 'zod';
// import { createLocalizedZodErrorMap } from '@/lib/zodLocalization';

// export default async function LocaleLayout({ children, params }) {
//   const errorMap = await createLocalizedZodErrorMap();
//   z.setErrorMap(errorMap);

//   return <>{children}</>;
// }
