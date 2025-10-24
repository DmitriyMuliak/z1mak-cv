export const contactFileTypes = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
} as const;

export const allowedContactFilesMimeTypes = Object.keys(contactFileTypes);

// Example of Issue - throw new v.ValiError doesn't pass error in RHF use rawCheck instead of it
// v.check
// const baseIssue: v.BaseIssue<typeof data> = {
//   type: 'custom',
//   kind: 'validation',
//   message: 'Captcha is required when files are attached',
//   input: data,
//   expected: 'token string',
//   received: `${data.recaptchaToken}`,
//   path: [
//     {
//       type: 'object',
//       key: 'recaptchaToken',
//       origin: 'value',
//       input: data,
//       value: data.recaptchaToken,
//     } satisfies v.IssuePathItem,
//   ],
// };
// const messageHandler = createMessageHandler('captchaRequired');
// const issue = {...baseIssue, message: messageHandler(baseIssue) };
// throw new v.ValiError([issue]);
