type Primitive = string | number | boolean | null | undefined;

type FlatPair = {
  key: string;
  value: Primitive;
};

/**
 * flattenObject
 * Flattens nested structures into a list of paths compatible with React Hook Form.
 * * @param data - The nested object or array to flatten.
 * @param prefix - (Internal) The current path prefix.
 * @param accumulator - (Internal) Accumulator for O(N) performance.
 * @returns An array of FlatPair objects (e.g., [{ key: 'items.0.name', value: '...' }]).
 */
export function flattenObject(
  data: unknown,
  prefix = '',
  accumulator: FlatPair[] = [],
): FlatPair[] {
  // 1. Base case: null or non-object
  if (data === null || typeof data !== 'object') {
    if (prefix !== '') {
      accumulator.push({ key: prefix, value: data as Primitive });
    }
    return accumulator;
  }

  // 2. Special cases (Date, RegExp, etc.) - treat as primitives
  // Add other types here if necessary (e.g., Blob, File)
  if (data instanceof Date) {
    accumulator.push({ key: prefix, value: data.toISOString() });
    return accumulator;
  }

  // 3. Recursive traversal
  // Object.keys works for arrays too (returns ["0", "1", ...]),
  // ensuring consistent "dot notation" for both objects and arrays.
  const keys = Object.keys(data);

  for (const key of keys) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    const value = (data as Record<string, unknown>)[key];

    if (typeof value === 'object' && value !== null) {
      flattenObject(value, newKey, accumulator);
    } else {
      accumulator.push({ key: newKey, value: value as Primitive });
    }
  }

  return accumulator;
}

// Example of errors from Backend or Valibot (already transformed/flattened)
// const apiErrors: FlatPair[] = [
//   { key: 'user.name', value: 'Required' },
//   { key: 'user.hobbies.0.name', value: 'Too short' },
// ];

// Setting form errors (Loop)
// useful for React Hook Form's setError
/*
apiErrors.forEach(({ key, value }) => {
   // Type casting might be needed depending on your RHF version/types
   setError(key as T, { type: 'server', message: value as T2 });
});
*/

// Example of use

// Data from RHF (onSubmit)
// const formValues = {
//   title: "New User",
//   profile: {
//     firstName: "John",
//     settings: {
//       notifications: true
//     },
//     // File which is can't be send via JSON
//     avatar: new File(["(binary)"], "avatar.png", { type: "image/png" })
//   },
//   tags: ["admin", "staff"]
// };

// const flatData = flattenObject(data);
