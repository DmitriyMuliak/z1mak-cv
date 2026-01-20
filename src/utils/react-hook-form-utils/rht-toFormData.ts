export const toFormData = (flatPairs: { key: string; value: unknown }[]): FormData => {
  const formData = new FormData();

  flatPairs.forEach(({ key, value }) => {
    // 1. Ignore undefined (don't send)
    if (value === undefined) return;

    // 2. Null convert to empty string, or ignore (depend on API contract)
    // Here is variant with empty string, for clear value on BE
    if (value === null) {
      formData.append(key, '');
      return;
    }

    // 3. Files append as it is
    if (value instanceof Blob || value instanceof File) {
      formData.append(key, value);
      return;
    }

    // 4. All other primitives (number, boolean) convert to String.
    formData.append(key, String(value));
  });

  return formData;
};

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

// Send request
// Payload example:
// -----------------------------
// Content-Disposition: form-data; name="title"
// New User
// Content-Disposition: form-data; name="profile.firstName"
// John
// Content-Disposition: form-data; name="profile.avatar"; filename="avatar.png"
// ...binary data...

// const sendDataToApi = async (data: typeof formValues) => {
//   const flatData = flattenObject(data);
//   const formData = toFormData(flatData);
//   await fetch('/api/user/create', {
//     method: 'POST',
//     body: formData,
//   });
// };
