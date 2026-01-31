import { cache } from 'react';
import { createQueryClient } from './queryClient';

export const getQueryClient = cache(() => createQueryClient());

// e.g. of use

// Server Component
// import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
// import { getQueryClient } from '@/lib/react-query/getQueryClient';
// import { getResumeStatus } from '@/actions/resume/resumeActions';

// export default async function Page() {
//   const queryClient = getQueryClient();

//   await queryClient.prefetchQuery({
//     queryKey: ['resume:status', jobId],
//     queryFn: () => getResumeStatus(jobId),
//   });

//   return (
//     <HydrationBoundary state={dehydrate(queryClient)}>
//       <ClientPart />
//     </HydrationBoundary>
//   );
// }

// Client Component
// const { data } = useQuery({
//   queryKey: ['resume:status', jobId],
//   queryFn: () => getResumeStatus(jobId),
// });
