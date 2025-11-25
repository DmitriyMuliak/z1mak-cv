import * as v from 'valibot';
import { createMessageHandler } from '@/lib/validator/createMessageHandler';
// import { toOpenApi } from 'valibot-openapi';
// toOpenApi(ProductSchema) Will convert this to JSON schema OpenAPI.

const allowedContactFilesMimeTypes = ['images'];
const MIN_SIZE_BYTES = 10000;

const _ExampleNameSchema = v.pipe(
  v.string(),
  v.minLength(5, createMessageHandler('specificNameKey')),
);

const _ExampleOfExtendSchema = v.object({
  // ...BaseContactSchema.entries,
});

const _FileSchema = v.object({
  file: v.object({
    size: v.pipe(v.number(), v.minValue(MIN_SIZE_BYTES, 'Розмір замалий')),
  }),
});

const _DynamicMessageExample = v.custom<File[]>(
  (files) => {
    return (
      Array.isArray(files) &&
      files.length === 1 &&
      files.every((f) => allowedContactFilesMimeTypes.includes(f.type))
    );
  },
  (issue) => {
    if (!Array.isArray(issue.input)) {
      return 'Очікувався масив файлів';
    }
    if (issue.input.length === 0) {
      return 'Потрібно додати хоча б один файл';
    }
    if (issue.input.length > 1) {
      return 'Можна завантажити тільки один файл';
    }
    for (const f of issue.input) {
      if (!allowedContactFilesMimeTypes.includes(f.type)) {
        return 'Неправильний тип файлу';
      }
    }
    return 'Невідома помилка';
  },
);

/*
  Example of maximum dividing of schemas
*/

const MAX_TEXT_LENGTH = 5000;

// 1. Variant A (Recommended): Inlining the action
// TS will automatically understand that maxLength here applies specifically to string
const BaseStringSchema = v.pipe(
  v.string(),
  v.maxLength(MAX_TEXT_LENGTH, createMessageHandler('c_max_length')),
);

// 2. Option B (If you really want to do it): Typing
// We explicitly say that this action is ONLY for string
const maxLenAction = v.maxLength<string, 5000, <T>(issue: v.BaseIssue<T>) => string>(
  MAX_TEXT_LENGTH,
  createMessageHandler('c_max_length'),
);

const _BaseStringSchemaVariantB = v.pipe(v.string(), maxLenAction);

// --- Use in your factory ---

const _RequiredStringSchema = v.pipe(
  BaseStringSchema,
  v.minLength(1, createMessageHandler('c_required')),
);

const _OptionalStringSchema = v.optional(BaseStringSchema);
