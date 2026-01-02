// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createFlow<TArgs extends any[], TResult>(
  handler: (signal: AbortSignal, ...args: TArgs) => Promise<TResult>,
) {
  return () => {
    const controller = new AbortController();
    let isRunning = false;

    async function run(...args: TArgs): Promise<TResult> {
      isRunning = true;
      try {
        const result = await handler(controller.signal, ...args);
        return result;
      } finally {
        isRunning = false;
      }
    }

    function cancel() {
      if (isRunning) controller.abort();
    }

    return { run, cancel, controller };
  };
}

// Example of use

// import { create } from 'zustand';
// import { createFlow } from './flow';

// interface UserState {
//   user: null | { id: string; name: string };
//   loadUser: ReturnType<typeof createFlow<[string], { id: string; name: string }>>;
// }

// const useUserStore = create<UserState>((set, get) => {
//   const loadUser = createFlow(async (signal, userId: string) => {
//     const res = await fetch(`/api/user/${userId}`, { signal });
//     return res.json();
//   })();

//   return {
//     user: null,
//     loadUser,
//   };
// });
