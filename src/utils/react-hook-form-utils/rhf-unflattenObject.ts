type Primitive = string | number | boolean | null | undefined;

type FlatPair = {
  key: string;
  value: Primitive;
};

/**
 * Helper: Checks if the key is a numeric array index.
 * Used to determine if we should initialize an Array or an Object during unflattening.
 */
const isIntString = (key: string): boolean => /^\d+$/.test(key);

/**
 * unflattenObject
 * Reconstructs the error or data structure from flat paths.
 * * Features:
 * - Automatically creates Arrays [] if the path segment is a number.
 * - Protected against prototype pollution.
 */
export function unflattenObject<T = Record<string, unknown>>(flatArray: FlatPair[]): T {
  // Use 'any' internally for dynamic traversal, but return generic T
  const result: Record<string, unknown> = {};

  for (const { key, value } of flatArray) {
    // Security check: Prevent prototype pollution
    if (key.includes('__proto__') || key.includes('constructor') || key.includes('prototype')) {
      continue;
    }

    const path = key.split('.');
    let current = result;

    for (let i = 0; i < path.length; i++) {
      const part = path[i];
      const nextPart = path[i + 1];
      const isLast = i === path.length - 1;

      if (isLast) {
        // Logic for leaf node: Assign the value
        current[part] = value;
      } else {
        // Logic for intermediate node: Determine structure (Array vs Object)

        // If the NEXT part of the key is a number (e.g., "0" in "users.0.name"),
        // we must initialize the current property as an Array, not an Object.
        // This is critical for RHF/Valibot array error structures.
        const isNextArray = nextPart !== undefined && isIntString(nextPart);

        if (!current[part] || typeof current[part] !== 'object') {
          current[part] = isNextArray ? [] : {};
        }

        current = current[part] as Record<string, unknown>;
      }
    }
  }

  return result as T;
}

/* --- Example Usage --- */

// Example of errors from Backend or Valibot (already transformed/flattened)
// const apiErrors: FlatPair[] = [
//   { key: 'user.name', value: 'Required' },
//   { key: 'user.hobbies.0.name', value: 'Too short' },
// ];

// Scenario 1: Setting form errors (Loop)
// useful for React Hook Form's setError
/*
apiErrors.forEach(({ key, value }) => {
   // Type casting might be needed depending on your RHF version/types
   setError(key as any, { type: 'server', message: value as string });
});
*/

// Scenario 2: Reconstructing the error object for Logging or UI display
// const errorObject = unflattenObject(apiErrors);

/*
  Result of errorObject:
  {
    user: {
      name: 'Required',
      hobbies: [
        { name: 'Too short' } // This is a real Array!
      ]
    }
  }
*/
