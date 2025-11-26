// 'use client';

// // app/cv-checker/page.tsx
// import { supabaseBrowser } from '@/lib/supabase/client';
// import React, { useEffect } from 'react';
// import { useCvStore } from './store/useCvStore';
// import { ModeBar } from './components/ModeBar';
// import { CvForm } from './components/CvForm';
// import { ResultView } from './components/ResultView';
// import { HistoryList } from './components/HistoryList';

// export function CvCheckerPage({ params }: any) {
//   // For demo assume userId from session (in prod use auth)
//   const userId = 'user-demo-1';

//   const [mode, setMode] = React.useState({
//     evaluationMode: 'general' as const,
//     domain: 'IT' as const,
//     depth: 'standard' as const
//   });

//   const { currentJobId, jobs, updateJob, setJobs } = useCvStore();

//   // subscribe to realtime updates for this user's jobs
//   useEffect(() => {
//     const channel = supabaseBrowser.channel('public:cv_jobs')
//       .on('postgres_changes', { event: '*', schema: 'public', table: 'cv_jobs', filter: `user_id=eq.${userId}` }, (payload) => {
//         const newRow = payload.new;
//         if (!newRow) return;
//         // update store
//         updateJob({ id: newRow.id, status: newRow.status, result: newRow.result, updated_at: newRow.updated_at });
//         // if completed, maybe set current job
//       })
//       .subscribe();

//     // load initial last 5 jobs
//     (async () => {
//       const { data } = await supabaseBrowser.from('cv_jobs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5);
//       if (data) setJobs(data as any);
//     })();

//     return () => {
//       supabaseBrowser.removeChannel(channel);
//     };
//   }, [userId, updateJob, setJobs]);

//   const activeJob = jobs.find(j => j.id === currentJobId) ?? null;

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <ModeBar mode={mode} onChange={setMode} />
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
//         <div className="md:col-span-2">
//           <CvForm userId={userId} defaultMode={mode} />
//           <div className="mt-6">
//             <h3 className="text-lg font-semibold">Result</h3>
//             {true || activeJob?.status === 'completed' ? (
//               <ResultView result={mockAnalysisResult || activeJob.result} />
//             ) : (
//               <div className="text-sm text-muted-foreground">No completed result selected. Select from history or queue a new job.</div>
//             )}
//           </div>
//         </div>

//         <aside className="md:col-span-1">
//           <h3 className="text-lg font-semibold">History</h3>
//           <HistoryList userId={userId} />
//         </aside>
//       </div>
//     </div>
//   );
// }

// // import { ResultView } from './components/ResultView';

// // Приклад даних у форматі JSON, який очікує компонент
// const mockAnalysisResult = {
//   overallAnalysis: {
//     matchScore: 85,
//     suitabilitySummary: "Кандидат демонструє сильні технічні навички у Frontend розробці (React, TypeScript), які повністю відповідають вимогам. Однак, досвід роботи з хмарними сервісами (AWS) менший, ніж бажано для цієї позиції. Загалом, це сильний кандидат із хорошим потенціалом для швидкого навчання.",
//   },
//   quantitativeMetrics: {
//     yearsOfExperience: 5.5,
//     skillsMatchRate: "8/10",
//     educationLevel: "Master's Degree",
//     keywordsFound: [
//       "React",
//       "TypeScript",
//       "Node.js",
//       "Tailwind",
//       "Docker"
//     ],
//     missingKeywords: [
//       "Kubernetes",
//       "AWS Lambda"
//     ]
//   },
//   redFlagsAndConcerns: {
//     flags: [
//       {
//         concern: "Часта зміна роботи",
//         details: "Кандидат змінив 3 компанії за останні 2 роки.",
//         severity: "Medium"
//       },
//       {
//         concern: "Прогалина в стажі",
//         details: "Розрив у стажі на 6 місяців між 2021 та 2022 роками без пояснень у CV.",
//         severity: "Low"
//       },
//       {
//         concern: "Відсутність лідерського досвіду",
//         details: "Позиція передбачає менторство, але в резюме не вказано досвіду керування командою.",
//         severity: "High"
//       }
//     ]
//   },
//   actionableImprovementPlan: {
//     technical: [
//       "Отримати сертифікацію AWS Cloud Practitioner.",
//       "Додати пет-проект з використанням Kubernetes."
//     ],
//     presentation: [
//       "Деталізувати досягнення на останньому місці роботи, використовуючи метрики (наприклад, 'покращив продуктивність на 20%').",
//       "Додати секцію 'Soft Skills' з акцентом на менторство."
//     ]
//   }
// };

// // // Використання компоненту
// // export default function Page() {
// //   return (
// //     <div className="p-6 max-w-3xl mx-auto border rounded shadow-sm">
// //       <ResultView result={mockAnalysisResult} />
// //     </div>
// //   );
// // }
