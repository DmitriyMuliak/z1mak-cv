export function formDataToObject(formData: FormData) {
  const object: Record<string | number, unknown> = {};

  for (const [key, value] of formData.entries()) {
    // if prop with this name already exist - convert it to array
    if (key in object) {
      if (!Array.isArray(object[key])) {
        object[key] = [object[key]];
      }
      (object[key] as [unknown]).push(value);
    } else {
      object[key] = value;
    }
  }

  return object;
}

/*
  For simple structure, doesn't create array for formData.append('files', file, file.name)
*/
export function formDataToObjectOld(formData: FormData): Record<string, unknown> {
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
