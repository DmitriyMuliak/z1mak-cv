import { ReportRenderer } from '@/features/components/ReportRenderer';
// import { mockAnalysisData, mockEmptyAnalysisData } from '@/feature/mokcs/mockAnalysisData';

export default async function CVCheckerAnalysis() {
  // For demo assume userId from session (in prod use auth)
  // const userId = 'user-demo-1';

  // const { newJobMode, currentJobId, jobs, updateJob, setJobs, setNewJobMode } = useCvStore();
  // const [report, setAnalysis] = useState<AnalysisSchemaType | null>(mockAnalysisData);

  // subscribe to realtime updates for this user's jobs -> useEffect (.on('postgres_changes',{}, () =>))

  // const activeJob = jobs.find((j) => j.id === currentJobId) ?? null;
  // SendToAnalyzeSchemaFE

  // const supabase = await createServerClient();
  // const [claims, session, user] = await Promise.all([
  //   supabase.auth.getClaims(),
  //   supabase.auth.getSession(),
  //   supabase.auth.getUser(),
  // ]);
  return (
    <>
      <ReportRenderer />
    </>
  );
}
