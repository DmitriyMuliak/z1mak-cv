import { Mode } from '@/feature/store/useCvStore';
import { Schema, Type } from '@google/genai';

const PROPERTY_DEFINITIONS = {
  overallAnalysis: {
    matchScore: {
      type: Type.NUMBER,
      description:
        'Number from 0 to 100. Assessment of how well the CV matches the vacancy. 0 - no match, 100 - perfect candidate.',
    },
    candidateLevel: {
      type: Type.STRING,
      format: 'enum',
      enum: ['Junior', 'Middle', 'Senior', 'Lead', 'Principal'],
      description: 'Assess the candidate level based on the CV',
    },
    jobTargetLevel: {
      type: Type.STRING,
      format: 'enum',
      enum: ['Junior', 'Middle', 'Senior', 'Lead', 'Principal'],
      description: 'Assess the level of the vacancy itself',
    },
    levelMatch: {
      type: Type.BOOLEAN,
      description: 'true or false, do the candidate and vacancy levels match?',
    },
    suitabilitySummary: {
      type: Type.STRING,
      description:
        'Short (3-4 sentences) summary: why the candidate fits or does not fit. Be honest.',
    },
    educationMatch: {
      type: Type.BOOLEAN,
      description: 'boolean. Does the education in the CV meet the vacancy requirements?',
    },
    jobHoppingFlag: {
      type: Type.BOOLEAN,
      description:
        "boolean. Are there signs of 'job hopping' (less than 1.5-2 years in the last 3+ positions)?",
    },
  },
  quantitativeMetrics: {
    totalYearsInCV: {
      type: Type.NUMBER,
      description: 'Number. Total work experience found in the CV (e.g., 8.5)',
    },
    relevantYearsInCV: {
      type: Type.NUMBER,
      description: 'Number. Work experience relevant to THIS vacancy',
    },
    requiredYearsInJob: {
      type: Type.NUMBER,
      description: 'Number. How many years of experience the vacancy requires (0 if not specified)',
    },
    keySkillCoveragePercent: {
      type: Type.NUMBER,
      description:
        'Number from 0 to 100. What percentage of REQUIRED skills from the vacancy were found in the CV?',
    },
    stackRecencyScore: {
      type: Type.NUMBER,
      description:
        "Number 0-100. How 'fresh' are the necessary skills? 100 - used the main stack at the current job, 0 - used long ago.",
    },
    softSkillsScore: {
      type: Type.NUMBER,
      description:
        'Number 0-100. How clearly expressed are the necessary Soft Skills (communication, leadership) in the text?',
    },
  },

  detailedSkillAnalysis: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      skills: {
        type: Type.ARRAY,
        maxItems: '10',
        items: {
          type: Type.OBJECT,
          properties: {
            skill: { type: Type.STRING, description: "Skill name (e.g., 'Node.js')" },
            type: {
              type: Type.STRING,
              format: 'enum',
              enum: ['Required', 'Desired'],
              description: "'Required' or 'Desired'",
            },
            status: {
              type: Type.STRING,
              format: 'enum',
              enum: ['Strongly Present', 'Mentioned', 'Inferred', 'Missing'],
            },
            evidenceFromCV: { type: Type.STRING, description: "Short quote or 'N/A'" },
            confidenceScore: { type: Type.NUMBER, description: 'Number 0-10' },
          },
          required: ['skill', 'type', 'status', 'evidenceFromCV', 'confidenceScore'],
        },
      },
    },
    required: ['title', 'skills'],
  },
  experienceRelevanceAnalysis: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      jobs: {
        type: Type.ARRAY,
        maxItems: '10',
        items: {
          type: Type.OBJECT,
          properties: {
            jobTitle: { type: Type.STRING },
            company: { type: Type.STRING },
            period: { type: Type.STRING },
            relevanceToRoleScore: { type: Type.NUMBER, description: 'Number 0-10' },
            comment: { type: Type.STRING },
          },
          required: ['jobTitle', 'company', 'period', 'relevanceToRoleScore', 'comment'],
        },
      },
    },
    required: ['title', 'jobs'],
  },
  redFlagsAndConcerns: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      flags: {
        type: Type.ARRAY,
        maxItems: '10',
        items: {
          type: Type.OBJECT,
          properties: {
            concern: { type: Type.STRING },
            details: { type: Type.STRING },
            severity: { type: Type.STRING, format: 'enum', enum: ['Low', 'Medium', 'High'] },
          },
          required: ['concern', 'details', 'severity'],
        },
      },
    },
    required: ['title', 'flags'],
  },
  suggestedInterviewQuestions: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      questions: {
        type: Type.ARRAY,
        maxItems: '10',
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            reason: { type: Type.STRING },
          },
          required: ['question', 'reason'],
        },
      },
    },
    required: ['title', 'questions'],
  },
  // Components for Improvement Plan
  improvementComponents: {
    summaryRewrite: {
      type: Type.OBJECT,
      properties: { suggestion: { type: Type.STRING }, example: { type: Type.STRING } },
      required: ['suggestion', 'example'],
    },
    keywordOptimization: {
      type: Type.OBJECT,
      properties: {
        missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
        suggestion: { type: Type.STRING },
      },
      required: ['missingKeywords', 'suggestion'],
    },
    quantifyAchievements: {
      type: Type.OBJECT,
      properties: {
        targetSection: { type: Type.STRING },
        suggestion: { type: Type.STRING },
        examplesToImprove: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['targetSection', 'suggestion', 'examplesToImprove'],
    },
    removeIrrelevant: {
      type: Type.OBJECT,
      properties: { suggestion: { type: Type.STRING } },
      required: ['suggestion'],
    },
  },
};

const buildOverallAnalysis = (isByJob: boolean, isDeep: boolean): Schema => {
  const props: Record<string, Schema> = {
    matchScore: PROPERTY_DEFINITIONS.overallAnalysis.matchScore,
    candidateLevel: PROPERTY_DEFINITIONS.overallAnalysis.candidateLevel,
    suitabilitySummary: PROPERTY_DEFINITIONS.overallAnalysis.suitabilitySummary,
  };

  const required = ['matchScore', 'candidateLevel', 'suitabilitySummary'];

  if (isByJob) {
    props.jobTargetLevel = PROPERTY_DEFINITIONS.overallAnalysis.jobTargetLevel;
    props.levelMatch = PROPERTY_DEFINITIONS.overallAnalysis.levelMatch;

    required.push('jobTargetLevel', 'levelMatch');

    if (isDeep) {
      props.educationMatch = PROPERTY_DEFINITIONS.overallAnalysis.educationMatch;
      props.jobHoppingFlag = PROPERTY_DEFINITIONS.overallAnalysis.jobHoppingFlag;

      required.push('educationMatch', 'jobHoppingFlag');
    }
  } else {
    // General mode logic: jobHoppingFlag is present here
    props.jobHoppingFlag = PROPERTY_DEFINITIONS.overallAnalysis.jobHoppingFlag;
    required.push('jobHoppingFlag');
  }

  return {
    type: Type.OBJECT,
    properties: props,
    required: required,
  };
};

const buildQuantitativeMetrics = (isByJob: boolean, isDeep: boolean): Schema => {
  const props: Record<string, Schema> = {
    totalYearsInCV: PROPERTY_DEFINITIONS.quantitativeMetrics.totalYearsInCV,
    relevantYearsInCV: PROPERTY_DEFINITIONS.quantitativeMetrics.relevantYearsInCV,
    requiredYearsInJob: PROPERTY_DEFINITIONS.quantitativeMetrics.requiredYearsInJob,
    keySkillCoveragePercent: PROPERTY_DEFINITIONS.quantitativeMetrics.keySkillCoveragePercent,
  };

  const required = [
    'totalYearsInCV',
    'relevantYearsInCV',
    'requiredYearsInJob',
    'keySkillCoveragePercent',
  ];

  const isShouldAddDetailedMetrics = isByJob && isDeep;

  if (isShouldAddDetailedMetrics) {
    props.stackRecencyScore = PROPERTY_DEFINITIONS.quantitativeMetrics.stackRecencyScore;
    props.softSkillsScore = PROPERTY_DEFINITIONS.quantitativeMetrics.softSkillsScore;

    required.push('stackRecencyScore', 'softSkillsScore');
  }

  return {
    type: Type.OBJECT,
    properties: props,
    required: required,
  };
};

const buildImprovementPlan = (isByJob: boolean): Schema => {
  const props: Record<string, Schema> = {
    title: { type: Type.STRING },
    summaryRewrite: PROPERTY_DEFINITIONS.improvementComponents.summaryRewrite as Schema,
    quantifyAchievements: PROPERTY_DEFINITIONS.improvementComponents.quantifyAchievements as Schema,
    removeIrrelevant: PROPERTY_DEFINITIONS.improvementComponents.removeIrrelevant as Schema,
  };

  const required = ['title', 'summaryRewrite', 'quantifyAchievements', 'removeIrrelevant'];

  if (isByJob) {
    props.keywordOptimization = PROPERTY_DEFINITIONS.improvementComponents
      .keywordOptimization as Schema;
    required.push('keywordOptimization');
  }

  return {
    type: Type.OBJECT,
    properties: props,
    required: required,
  };
};

export const getCvAnalysisSchema = (mode: Mode): Schema => {
  const isByJob = mode.evaluationMode === 'byJob';
  const isDeep = mode.depth === 'deep';

  const properties: Record<string, Schema> = {
    analysisTimestamp: { type: Type.STRING, description: 'Current ISO date and time' },
    overallAnalysis: buildOverallAnalysis(isByJob, isDeep),
    quantitativeMetrics: buildQuantitativeMetrics(isByJob, isDeep),
    redFlagsAndConcerns: PROPERTY_DEFINITIONS.redFlagsAndConcerns as Schema,
    actionableImprovementPlan: buildImprovementPlan(isByJob),
  };

  const isHardMode = isByJob && isDeep;

  if (isHardMode) {
    properties.detailedSkillAnalysis = PROPERTY_DEFINITIONS.detailedSkillAnalysis as Schema;
    properties.suggestedInterviewQuestions =
      PROPERTY_DEFINITIONS.suggestedInterviewQuestions as Schema;
  }

  if (isByJob) {
    properties.experienceRelevanceAnalysis =
      PROPERTY_DEFINITIONS.experienceRelevanceAnalysis as Schema;
  }
  const required = Object.keys(properties);

  return {
    type: Type.OBJECT,
    properties,
    required,
  };
};

export const cvAnalysisSchema = getCvAnalysisSchema({
  evaluationMode: 'byJob',
  domain: 'it',
  depth: 'deep',
});
