// import { Mode } from '@/feature/store/useCvStore';
// import { Schema, Type } from '@google/genai';

// // export interface Mode {
// //   evaluationMode: 'general' | 'byJob';
// //   domain: 'it' | 'common';
// //   depth: 'standard' | 'deep';
// // }

// const baseFullCvAnalysisSchemaObject = {
//   type: Type.OBJECT,
//   properties: {
//     analysisTimestamp: {
//       type: Type.STRING,
//       description: 'Current ISO date and time',
//     },
//     overallAnalysis: {
//       type: Type.OBJECT,
//       properties: {
//         matchScore: {
//           type: Type.NUMBER,
//           description:
//             'Number from 0 to 100. Assessment of how well the CV matches the vacancy. 0 - no match, 100 - perfect candidate.',
//         },
//         candidateLevel: {
//           type: Type.STRING,
//           format: 'enum',
//           enum: ['Junior', 'Middle', 'Senior', 'Lead', 'Principal'],
//           description: 'Assess the candidate level based on the CV',
//         },
//         jobTargetLevel: {
//           type: Type.STRING,
//           format: 'enum',
//           enum: ['Junior', 'Middle', 'Senior', 'Lead', 'Principal'],
//           description: 'Assess the level of the vacancy itself',
//         },
//         levelMatch: {
//           type: Type.BOOLEAN,
//           description: 'true or false, do the candidate and vacancy levels match?',
//         },
//         suitabilitySummary: {
//           type: Type.STRING,
//           description:
//             'Short (3-4 sentences) summary: why the candidate fits or does not fit. Be honest.',
//         },
//         educationMatch: {
//           type: Type.BOOLEAN,
//           description: 'boolean. Does the education in the CV meet the vacancy requirements?',
//         },
//         jobHoppingFlag: {
//           type: Type.BOOLEAN,
//           description:
//             "boolean. Are there signs of 'job hopping' (less than 1.5-2 years in the last 3+ positions)?",
//         },
//       },
//       required: [
//         'matchScore',
//         'candidateLevel',
//         'jobTargetLevel',
//         'levelMatch',
//         'suitabilitySummary',
//         'educationMatch',
//         'jobHoppingFlag',
//       ],
//     },
//     quantitativeMetrics: {
//       type: Type.OBJECT,
//       properties: {
//         totalYearsInCV: {
//           type: Type.NUMBER,
//           description: 'Number. Total work experience found in the CV (e.g., 8.5)',
//         },
//         relevantYearsInCV: {
//           type: Type.NUMBER,
//           description: 'Number. Work experience relevant to THIS vacancy',
//         },
//         requiredYearsInJob: {
//           type: Type.NUMBER,
//           description:
//             'Number. How many years of experience the vacancy requires (0 if not specified)',
//         },
//         keySkillCoveragePercent: {
//           type: Type.NUMBER,
//           description:
//             'Number from 0 to 100. What percentage of REQUIRED skills from the vacancy were found in the CV?',
//         },
//         stackRecencyScore: {
//           type: Type.NUMBER,
//           description:
//             "Number 0-100. How 'fresh' are the necessary skills? 100 - used the main stack at the current job, 0 - used long ago.",
//         },
//         softSkillsScore: {
//           type: Type.NUMBER,
//           description:
//             'Number 0-100. How clearly expressed are the necessary Soft Skills (communication, leadership) in the text?',
//         },
//       },
//       required: [
//         'totalYearsInCV',
//         'relevantYearsInCV',
//         'requiredYearsInJob',
//         'keySkillCoveragePercent',
//       ],
//     },
//     detailedSkillAnalysis: {
//       type: Type.OBJECT,
//       properties: {
//         title: { type: Type.STRING },
//         skills: {
//           type: Type.ARRAY,
//           maxItems: '10',
//           items: {
//             type: Type.OBJECT,
//             properties: {
//               skill: {
//                 type: Type.STRING,
//                 description: "Skill name (e.g., 'Node.js')",
//               },
//               type: {
//                 type: Type.STRING,
//                 format: 'enum',
//                 enum: ['Required', 'Desired'],
//                 description: "'Required' or 'Desired' - based on the vacancy text",
//               },
//               status: {
//                 type: Type.STRING,
//                 format: 'enum',
//                 enum: ['Strongly Present', 'Mentioned', 'Inferred', 'Missing'],
//               },
//               evidenceFromCV: {
//                 type: Type.STRING,
//                 description:
//                   "Short quote or description from the CV confirming the skill's presence, or 'N/A' if missing",
//               },
//               confidenceScore: {
//                 type: Type.NUMBER,
//                 description:
//                   'Number from 0 to 10. How convincingly the skill mastery is proven (0 - missing, 10 - perfect)',
//               },
//             },
//             required: ['skill', 'type', 'status', 'evidenceFromCV', 'confidenceScore'],
//           },
//         },
//       },
//       required: ['title', 'skills'],
//     },
//     experienceRelevanceAnalysis: {
//       type: Type.OBJECT,
//       properties: {
//         title: { type: Type.STRING },
//         jobs: {
//           type: Type.ARRAY,
//           maxItems: '10',
//           items: {
//             type: Type.OBJECT,
//             properties: {
//               jobTitle: { type: Type.STRING },
//               company: { type: Type.STRING },
//               period: { type: Type.STRING },
//               relevanceToRoleScore: {
//                 type: Type.NUMBER,
//                 description:
//                   'Number from 0 to 10. How relevant is this experience for the new vacancy?',
//               },
//               comment: {
//                 type: Type.STRING,
//                 description: 'Short comment on why this experience is (or is not) relevant',
//               },
//             },
//             required: ['jobTitle', 'company', 'period', 'relevanceToRoleScore', 'comment'],
//           },
//         },
//       },
//       required: ['title', 'jobs'],
//     },
//     redFlagsAndConcerns: {
//       type: Type.OBJECT,
//       properties: {
//         title: { type: Type.STRING },
//         flags: {
//           type: Type.ARRAY,
//           maxItems: '10',
//           items: {
//             type: Type.OBJECT,
//             properties: {
//               concern: {
//                 type: Type.STRING,
//                 description: "Name of the issue (e.g., 'Employment gap')",
//               },
//               details: {
//                 type: Type.STRING,
//                 description: 'Explanation of the issue and why it might be a risk',
//               },
//               severity: {
//                 type: Type.STRING,
//                 format: 'enum',
//                 enum: ['Low', 'Medium', 'High'],
//               },
//             },
//             required: ['concern', 'details', 'severity'],
//           },
//         },
//       },
//       required: ['title', 'flags'],
//     },
//     actionableImprovementPlan: {
//       type: Type.OBJECT,
//       properties: {
//         title: { type: Type.STRING },
//         summaryRewrite: {
//           type: Type.OBJECT,
//           properties: {
//             suggestion: {
//               type: Type.STRING,
//               description: "Advice on how to rewrite the 'Summary' section",
//             },
//             example: {
//               type: Type.STRING,
//               description: "Write 1-2 sentences of an updated 'Summary'",
//             },
//           },
//           required: ['suggestion', 'example'],
//         },
//         keywordOptimization: {
//           type: Type.OBJECT,
//           properties: {
//             missingKeywords: {
//               type: Type.ARRAY,
//               maxItems: '10',
//               items: { type: Type.STRING },
//               description: 'List of keywords from the vacancy that are missing in the CV',
//             },
//             suggestion: { type: Type.STRING },
//           },
//           required: ['missingKeywords', 'suggestion'],
//         },
//         quantifyAchievements: {
//           type: Type.OBJECT,
//           properties: {
//             targetSection: { type: Type.STRING },
//             suggestion: { type: Type.STRING },
//             examplesToImprove: {
//               type: Type.ARRAY,
//               maxItems: '10',
//               items: { type: Type.STRING },
//               description: 'Quotes from the CV that need improvement',
//             },
//           },
//           required: ['targetSection', 'suggestion', 'examplesToImprove'],
//         },
//         removeIrrelevant: {
//           type: Type.OBJECT,
//           properties: {
//             suggestion: {
//               type: Type.STRING,
//               description: 'What can be removed (outdated/irrelevant)',
//             },
//           },
//           required: ['suggestion'],
//         },
//       },
//       required: [
//         'title',
//         'summaryRewrite',
//         'keywordOptimization',
//         'quantifyAchievements',
//         'removeIrrelevant',
//       ],
//     },
//     suggestedInterviewQuestions: {
//       type: Type.OBJECT,
//       properties: {
//         title: { type: Type.STRING },
//         questions: {
//           type: Type.ARRAY,
//           maxItems: '10',
//           items: {
//             type: Type.OBJECT,
//             properties: {
//               question: {
//                 type: Type.STRING,
//                 description: 'Technical or behavioral question',
//               },
//               reason: {
//                 type: Type.STRING,
//                 description: 'Which specific gap this question verifies',
//               },
//             },
//             required: ['question', 'reason'],
//           },
//         },
//       },
//       required: ['title', 'questions'],
//     },
//   },
//   required: [
//     'analysisTimestamp',
//     'overallAnalysis',
//     'quantitativeMetrics',
//     'detailedSkillAnalysis',
//     'experienceRelevanceAnalysis',
//     'redFlagsAndConcerns',
//     'actionableImprovementPlan',
//     'suggestedInterviewQuestions',
//   ],
// };

// export const cvAnalysisSchema = baseFullCvAnalysisSchemaObject as unknown as Schema;
