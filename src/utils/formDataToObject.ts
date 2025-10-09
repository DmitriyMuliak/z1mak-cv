export function formDataToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};

  for (const [rawKey, value] of formData.entries()) {
    const keys = rawKey
      .replace(/\]/g, '') // replace closed bracket
      .split(/\[/); // divide by [

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let target: any = obj;

    keys.forEach((k, i) => {
      const isLast = i === keys.length - 1;

      // array if key is empty (name[])
      const key = k === '' ? undefined : k;

      if (isLast) {
        if (key === undefined) {
          if (!Array.isArray(target)) target = [];
          target.push(value);
        } else {
          target[key] = value;
        }
      } else {
        // intermediate object/array
        if (key === undefined) {
          if (!Array.isArray(target)) target = [];
          if (!target[target.length - 1]) target.push({});
          target = target[target.length - 1];
        } else {
          if (!(key in target)) target[key] = {};
          target = target[key];
        }
      }
    });
  }

  return obj;
}
