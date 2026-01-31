import { vi } from 'vitest';

export const readLimitedBody = vi.fn(async (response: Response) => {
  return response.clone().text(); // We read response. Can be read once
});

// response.clone()
// OR return new Promise()
// mockFetch.mockImplementation(() => {
//   return Promise.resolve(
//     new Response(JSON.stringify(errorBody), {
//       status: 404,
//       statusText: 'Not Found',
//     }),
//   );
// });
// OR
// import * as bodyReaderModule from '@/api/apiService/moduleName';
// const mockApiError = (status: number, bodyData: object | string) => {
//   const bodyString = typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData);
//   vi.mocked(bodyReaderModule.readLimitedBody).mockResolvedValue(bodyString);
//   mockFetch.mockResolvedValue(new Response(null, { status, statusText: 'Mocked Error' }));
// };
