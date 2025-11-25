import { AnalysisResult } from '@/feature/components/AnalysisResult';
import { mockAnalysisData } from '@/feature/mokcs/mockAnalysisData';

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
      <AnalysisResult data={mockAnalysisData} />
    </>
  );
}

const _mockData = {
  analysisTimestamp: '2024-05-15T10:00:00Z',
  overallAnalysis: {
    matchScore: 85,
    candidateLevel: 'Senior',
    suitabilitySummary:
      'Кандидат демонструє сильний досвід на позиції Senior Full Stack Engineer, особливо в React та Node.js. Його досвід у FinTech та високотрафікових середовищах є значною перевагою. Поточний період навчання та особисті проєкти свідчать про прагнення до розвитку, але потребують чіткішого представлення досягнень.',
    jobHoppingFlag: false,
  },
  quantitativeMetrics: {
    totalYearsInCV: 9.5,
    relevantYearsInCV: 9.5,
    requiredYearsInJob: 0,
    keySkillCoveragePercent: 90,
  },
  redFlagsAndConcerns: {
    title: 'Червоні прапори та занепокоєння',
    flags: [
      {
        concern: "Нечіткі досягнення під час перерви в кар'єрі",
        details:
          "Опис проєктів під час перерви в кар'єрі (High-Load Booking System, AI CV Analyzer) є загальним і не містить кількісних показників успіху або конкретних технічних викликів, які були подолані.",
        severity: 'Medium',
      },
      {
        concern: 'Застарілі технології',
        details:
          'Згадуються Vue.js та PHP/WordPress, які не є основними для заявленої ролі Senior Full Stack Engineer (React/Node.js), хоча й демонструють широту досвіду.',
        severity: 'Low',
      },
      {
        concern: 'Недостатня деталізація бекенд-досвіду',
        details:
          'Хоча вказано Node.js та NestJS, деталі реалізації бекенд-частини в попередніх проєктах (до перерви) могли б бути більш розкриті.',
        severity: 'Low',
      },
    ],
  },
  actionableImprovementPlan: {
    title: 'План дій для покращення резюме',
    summaryRewrite: {
      suggestion:
        'Переформулювати резюме, щоб воно чіткіше відображало досвід Full Stack, підкреслюючи досягнення в Node.js та NestJS, а не лише в React. Акцентувати на масштабованості та надійності рішень.',
      example:
        'Продуктивно-орієнтований Senior Full Stack Engineer з 10+ роками досвіду в розробці високопродуктивних Frontend-архітектур (React/TypeScript) та критично важливих FinTech-рішень. Досвідчений у створенні надійних систем для високотрафікових середовищ, з глибоким розумінням оптимізації Web Vitals та тестування. Активно розвиває експертизу в Backend (Node.js, NestJS, PostgreSQL), успішно застосовуючи її для створення комплексних Full Stack рішень, включаючи асинхронну обробку та керування транзакціями.',
    },
    quantifyAchievements: {
      targetSection: "Професійний досвід (особливо під час перерви в кар'єрі)",
      suggestion:
        'Додати кількісні показники до опису проєктів. Наприклад, вказати, на скільки відсотків було покращено продуктивність, зменшено час обробки запитів, або скільки користувачів/транзакцій було оброблено.',
      examplesToImprove: [
        'High-Load Booking System (NestJS / PostgreSQL): Додати показники щодо продуктивності системи під високим навантаженням (наприклад, транзакцій на секунду) або зменшення часу обробки замовлень.',
        'Pet Project (AI CV Analyzer): Вказати, які саме AI моделі використовувалися, як оптимізовано процес аналізу, або чи є вже перші користувачі/тестувальники.',
        'WIX - Scale & Reliability: Додати конкретні цифри щодо оптимізації продуктивності або стабільності під час пікових навантажень (наприклад, зменшення часу завантаження на X%, обробка Y транзакцій на секунду).',
      ],
    },
    removeIrrelevant: {
      suggestion:
        'Розглянути можливість скорочення або видалення розділів, що описують досвід з Vue.js, PHP, WordPress, якщо вони не є релевантними для конкретної вакансії, щоб зосередити увагу на основних технологіях (React, Node.js, TypeScript).',
    },
  },
};
