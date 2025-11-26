import * as v from 'valibot';

const SkillSchema = v.object({
  skill: v.string(),
  type: v.string(),
  status: v.string(),
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
  severity: v.string(),
});

const QuantitativeMetricsSchema = v.object({
  totalYearsInCV: v.number(),
  relevantYearsInCV: v.number(),
  keySkillCoveragePercent: v.number(),
  stackRecencyScore: v.optional(v.number()),
  softSkillsScore: v.optional(v.number()),
  requiredYearsInJob: v.optional(v.number()),
});

const OverallAnalysisSchema = v.object({
  independentCvScore: v.number(),
  independentTechCvScore: v.number(),
  candidateLevel: v.string(),
  suitabilitySummary: v.string(),
  // Optional fields
  matchScore: v.optional(v.number()),
  jobTargetLevel: v.optional(v.string()),
  levelMatch: v.optional(v.boolean()),
  educationMatch: v.optional(v.boolean()),
  jobHoppingFlag: v.optional(v.boolean()),
});

export const AnalysisSchema = v.object({
  analysisTimestamp: v.string(),
  overallAnalysis: OverallAnalysisSchema,
  quantitativeMetrics: QuantitativeMetricsSchema,

  redFlagsAndConcerns: v.object({
    title: v.string(),
    flags: v.array(FlagSchema),
  }),

  actionableImprovementPlan: v.object({
    title: v.string(),
    summaryRewrite: v.object({ suggestion: v.string(), example: v.string() }),
    quantifyAchievements: v.object({
      targetSection: v.string(),
      suggestion: v.string(),
      examplesToImprove: v.array(v.string()),
    }),
    removeIrrelevant: v.object({ suggestion: v.string() }),
    // Optional block
    keywordOptimization: v.optional(
      v.object({
        missingKeywords: v.array(v.string()),
        suggestion: v.string(),
      }),
    ),
  }),

  // Optional top-level sections
  detailedSkillAnalysis: v.optional(
    v.object({
      title: v.string(),
      skills: v.array(SkillSchema),
    }),
  ),

  experienceRelevanceAnalysis: v.optional(
    v.object({
      title: v.string(),
      jobs: v.array(JobExpSchema),
    }),
  ),

  suggestedInterviewQuestions: v.optional(
    v.object({
      title: v.string(),
      questions: v.array(v.object({ question: v.string(), reason: v.string() })),
    }),
  ),

  metadata: v.object({
    isValidCv: v.boolean(),
    isJobDescriptionPresent: v.boolean(),
    isValidJobDescription: v.boolean(),
  }),
});

export type AnalysisSchemaType = v.InferOutput<typeof AnalysisSchema>;
