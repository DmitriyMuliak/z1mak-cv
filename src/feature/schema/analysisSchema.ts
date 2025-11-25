import * as v from 'valibot';

const SkillSchema = v.object({
  skill: v.string(),
  type: v.string(), // 'Required' | 'Desired'
  status: v.string(), // 'Strongly Present' | 'Mentioned' | 'Inferred' | 'Missing'
  evidenceFromCV: v.string(),
  confidenceScore: v.number(),
});

const JobExpSchema = v.object({
  jobTitle: v.string(),
  company: v.string(),
  period: v.string(),
  relevanceToRoleScore: v.number(),
  comment: v.string(),
});

const FlagSchema = v.object({
  concern: v.string(),
  details: v.string(),
  severity: v.string(), // 'Low' | 'Medium' | 'High'
});

const QuantitativeMetricsSchema = v.object({
  totalYearsInCV: v.number(),
  relevantYearsInCV: v.number(),
  requiredYearsInJob: v.number(),
  keySkillCoveragePercent: v.number(),
  stackRecencyScore: v.number(),
  softSkillsScore: v.number(),
});

const OverallAnalysisSchema = v.object({
  matchScore: v.number(),
  candidateLevel: v.string(),
  jobTargetLevel: v.string(),
  levelMatch: v.boolean(),
  suitabilitySummary: v.string(),
  educationMatch: v.boolean(),
  jobHoppingFlag: v.boolean(),
});

export const AnalysisSchema = v.object({
  analysisTimestamp: v.string(),
  overallAnalysis: OverallAnalysisSchema,
  quantitativeMetrics: QuantitativeMetricsSchema,
  detailedSkillAnalysis: v.object({
    title: v.string(),
    skills: v.array(SkillSchema),
  }),
  experienceRelevanceAnalysis: v.object({
    title: v.string(),
    jobs: v.array(JobExpSchema),
  }),
  redFlagsAndConcerns: v.object({
    title: v.string(),
    flags: v.array(FlagSchema),
  }),
  actionableImprovementPlan: v.object({
    title: v.string(),
    summaryRewrite: v.object({
      suggestion: v.string(),
      example: v.string(),
    }),
    keywordOptimization: v.object({
      missingKeywords: v.array(v.string()),
      suggestion: v.string(),
    }),
    quantifyAchievements: v.object({
      targetSection: v.string(),
      suggestion: v.string(),
      examplesToImprove: v.array(v.string()),
    }),
    removeIrrelevant: v.object({
      suggestion: v.string(),
    }),
  }),
  suggestedInterviewQuestions: v.object({
    title: v.string(),
    questions: v.array(
      v.object({
        question: v.string(),
        reason: v.string(),
      }),
    ),
  }),
});

export type AnalysisSchemaType = v.InferOutput<typeof AnalysisSchema>;
