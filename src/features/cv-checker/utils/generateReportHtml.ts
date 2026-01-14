import { AnalysisSchemaType } from '../schema/analysisSchema';
// import { getFullLocale } from '@/i18n/getFullLocale';
import type { IParagraphOptions, Paragraph as ParagraphType } from 'docx';
import type { MessagesBase, NamespacedRelativeMessageKeys } from '@/types/translations';
// import { formatToUserDate } from '@/utils/date';

type ReportKeys = NamespacedRelativeMessageKeys<MessagesBase, 'pages.cvReport'>;

export const generateAndDownloadDocxReport = async (
  data: AnalysisSchemaType,
  _locale: string,
  t: (key: ReportKeys) => string,
) => {
  const { saveAs } = await import('file-saver');
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    HeadingLevel,
    AlignmentType,
    ShadingType,
    BorderStyle,
    TableLayoutType,
    VerticalAlign,
    HeightRule,
    Footer,
  } = await import('docx');

  const {
    overallAnalysis: oa,
    quantitativeMetrics: qm,
    detailedSkillAnalysis: dsa,
    redFlagsAndConcerns: flags,
    actionableImprovementPlan: plan,
    experienceRelevanceAnalysis: expRelevance,
    suggestedInterviewQuestions: questions,
  } = data;

  // --- HELPERS ---

  const createLabelValue = (label: string, value: string | number) => {
    return new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({ text: `${label}: `, bold: true, size: 22 }),
        new TextRun({ text: `${value}`, size: 22 }),
      ],
    });
  };

  const createScoreBlock = (label: string, value: number) => {
    return [
      new Paragraph({ text: label, heading: HeadingLevel.HEADING_3 }),
      new Paragraph({
        children: [
          new TextRun({
            text: `${value}/100`,
            bold: true,
            size: 48,
            color: '2E75B6',
          }),
        ],
        spacing: { after: 200 },
      }),
    ];
  };

  const createProgressBarText = (percent: number) => {
    const totalBlocks = 15;
    const filledBlocks = Math.round((percent / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;
    const bar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
    return `${bar} ${percent}%`;
  };

  const createSectionHeader = (
    text: string,
    options: IParagraphOptions = {} as IParagraphOptions,
  ) => {
    return new Paragraph({
      text: text,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, space: 1, color: 'auto' },
      },
      ...options,
    });
  };

  const createMarginBlock = () => {
    return new Paragraph({
      heading: HeadingLevel.HEADING_6,
      text: ` `,
    });
  };

  const createCell = (children: ParagraphType[], widthPercent: number) => {
    return new TableCell({
      children: children,
      width: { size: widthPercent, type: WidthType.PERCENTAGE },
      margins: { top: 100, bottom: 100, left: 100, right: 100 },
      verticalAlign: VerticalAlign.TOP,
    });
  };

  // --- Main Logic ---
  // formatToUserDate; --- add to state createdAt field (we already return it from API)
  // const generatedAtDate = formatToUserDate(data.analysisTimestamp, {
  //   locale: getFullLocale(locale),
  // });

  const T_YES = t('overall.yes');
  const T_NO = t('overall.no');
  const T_TITLE = t('title');

  const overallMatchScore =
    oa.matchScore !== undefined ? createScoreBlock(t('overall.matchScore'), oa.matchScore) : [];
  const overallIndependentCvScore =
    oa.independentCvScore !== undefined
      ? createScoreBlock(t('overall.independentCvScore'), oa.independentCvScore)
      : [];
  const overallIndependentTechCvScore =
    oa.independentTechCvScore !== undefined
      ? createScoreBlock(t('overall.independentTechCvScore'), oa.independentTechCvScore)
      : [];

  const jobTargetLevel =
    oa.jobTargetLevel !== undefined
      ? [createLabelValue(t('overall.jobTargetLevel'), oa.jobTargetLevel)]
      : [];
  const levelMatch =
    oa.levelMatch !== undefined
      ? [createLabelValue(t('overall.levelMatch'), oa.levelMatch ? T_YES : T_NO)]
      : [];
  const educationMatch =
    oa.educationMatch !== undefined
      ? [createLabelValue(t('overall.educationMatch'), oa.educationMatch ? T_YES : T_NO)]
      : [];
  const jobHoppingFlag =
    oa.jobHoppingFlag !== undefined
      ? [createLabelValue(t('overall.jobHoppingFlag'), oa.jobHoppingFlag ? T_YES : T_NO)]
      : [];

  const requiredYearsInJob =
    qm.requiredYearsInJob !== undefined
      ? [createLabelValue(t('metrics.requiredYears'), qm.requiredYearsInJob)]
      : [];

  const relevantYearsInCV =
    qm.relevantYearsInCV !== undefined
      ? [createLabelValue(t('metrics.relevantYears'), qm.relevantYearsInCV)]
      : [];

  const isPlan = !!plan;
  const isPlanKeywordOptimization = isPlan && plan.keywordOptimization !== undefined;
  const planKeywordOptimization = isPlanKeywordOptimization
    ? [
        new Paragraph({ text: t('improvement.missing'), heading: HeadingLevel.TITLE }),
        new Paragraph({
          children: [
            new TextRun({
              text: plan.keywordOptimization!.missingKeywords.join(', ') || 'None',
              color: '000000',
              bold: false,
              italics: false,
            }),
          ],
          spacing: { after: 300 },
        }),
      ]
    : [];

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22 }, // 11pt Standard
        },
        heading1: {
          run: { size: 36, bold: true, color: '2E75B6' },
          paragraph: { spacing: { after: 240 } },
        },
        heading2: {
          run: { size: 28, bold: true, color: '1F4E79' },
          paragraph: { spacing: { before: 240, after: 120 } },
        },
        heading3: {
          run: { size: 24, bold: true, color: '444444' },
          paragraph: { spacing: { after: 120 } },
        },
        title: {
          run: { size: 24, bold: true, color: '000000' },
          paragraph: { spacing: { after: 120 } },
        },
        // Used for spacing (fix library bug)
        heading6: {
          run: { size: 11, color: '444444' },
          paragraph: { spacing: { after: 150 } },
        },
      },
    },
    sections: [
      {
        properties: {},
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Powered by AI CV Analyzer',
                    color: 'AAAAAA',
                    size: 18,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // === HEADER ===
          new Paragraph({
            text: T_TITLE,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          // new Paragraph({
          //   text: `${t('generatedOnTitle')}: ${generatedAtDate}`,
          //   alignment: AlignmentType.CENTER,
          //   spacing: { after: 400 },
          //   style: 'Subtitle',
          // }),

          // === 1. OVERALL ANALYSIS TABLE ===
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            columnWidths: [5000, 5000],
            rows: [
              new TableRow({
                children: [
                  createCell(
                    [
                      ...overallMatchScore,
                      ...overallIndependentCvScore,
                      ...overallIndependentTechCvScore,
                      new Paragraph({ text: oa.suitabilitySummary }),
                    ],
                    50,
                  ),

                  createCell(
                    [
                      new Paragraph({
                        text: t('overall.fitAssessment'),
                        heading: HeadingLevel.HEADING_3,
                      }),
                      createLabelValue(t('overall.candidateLevel'), oa.candidateLevel),
                      ...jobTargetLevel,
                      ...levelMatch,
                      ...educationMatch,
                      ...jobHoppingFlag,
                    ],
                    50,
                  ),
                ],
              }),
            ],
          }),

          // === 2. METRICS TABLE ===
          createSectionHeader(t('metrics.title')),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            columnWidths: [4000, 6000],
            rows: [
              new TableRow({
                children: [
                  createCell(
                    [
                      new Paragraph({
                        text: t('experience.title'),
                        heading: HeadingLevel.HEADING_3,
                      }),
                      createLabelValue(t('metrics.totalYears'), qm.totalYearsInCV),
                      ...relevantYearsInCV,
                      ...requiredYearsInJob,
                    ],
                    40,
                  ),

                  ...(qm.keySkillCoveragePercent !== undefined ||
                  qm.stackRecencyScore !== undefined ||
                  qm.softSkillsScore !== undefined
                    ? [
                        createCell(
                          [
                            new Paragraph({
                              text: t('skills.title'),
                              heading: HeadingLevel.HEADING_3,
                            }),
                            ...(qm.keySkillCoveragePercent !== undefined
                              ? [
                                  new Paragraph({
                                    children: [
                                      new TextRun({
                                        text: `${t('skills.keyCoverage')}: `,
                                        bold: true,
                                      }),
                                    ],
                                    spacing: { after: 50 },
                                  }),
                                  new Paragraph({
                                    children: [
                                      new TextRun({
                                        text: createProgressBarText(qm.keySkillCoveragePercent),
                                        font: 'Courier New',
                                      }),
                                    ],
                                    spacing: { after: 150 },
                                  }),
                                ]
                              : []),

                            ...(qm.stackRecencyScore !== undefined
                              ? [
                                  new Paragraph({
                                    children: [
                                      new TextRun({
                                        text: `${t('skills.stackRecency')}: `,
                                        bold: true,
                                      }),
                                    ],
                                    spacing: { after: 50 },
                                  }),
                                  new Paragraph({
                                    children: [
                                      new TextRun({
                                        text: createProgressBarText(qm.stackRecencyScore),
                                        font: 'Courier New',
                                      }),
                                    ],
                                    spacing: { after: 150 },
                                  }),
                                ]
                              : []),

                            ...(qm.softSkillsScore !== undefined
                              ? [
                                  new Paragraph({
                                    children: [
                                      new TextRun({
                                        text: `${t('skills.softMatch')}: `,
                                        bold: true,
                                      }),
                                    ],
                                    spacing: { after: 50 },
                                  }),
                                  new Paragraph({
                                    children: [
                                      new TextRun({
                                        text: createProgressBarText(qm.softSkillsScore),
                                        font: 'Courier New',
                                      }),
                                    ],
                                  }),
                                ]
                              : []),
                          ],
                          60,
                        ),
                      ]
                    : []),
                ],
              }),
            ],
          }),

          // === 3. DETAILED SKILLS ===
          ...(dsa
            ? [
                createSectionHeader(t('skills.analysisTitle'), { keepNext: true }),

                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  layout: TableLayoutType.FIXED,
                  columnWidths: [2500, 2000, 1500, 4000],
                  rows: [
                    new TableRow({
                      tableHeader: true,
                      cantSplit: false,
                      height: { value: 400, rule: HeightRule.ATLEAST },
                      children: ['Skill', 'Type/Status', 'Score', 'Evidence'].map(
                        (text) =>
                          new TableCell({
                            width: { size: 25, type: WidthType.PERCENTAGE },
                            shading: { fill: 'E7E6E6', type: ShadingType.CLEAR, color: 'auto' },
                            children: [
                              new Paragraph({ children: [new TextRun({ text, bold: true })] }),
                            ],
                            verticalAlign: VerticalAlign.CENTER,
                            margins: { top: 100, bottom: 100, left: 100, right: 100 },
                          }),
                      ),
                    }),
                    ...dsa.skills.map(
                      (skill) =>
                        new TableRow({
                          cantSplit: false,
                          children: [
                            createCell(
                              [
                                new Paragraph({
                                  children: [new TextRun({ text: skill.skill, bold: true })],
                                }),
                              ],
                              25,
                            ),
                            createCell(
                              [
                                new Paragraph({
                                  children: [new TextRun({ text: skill.type, size: 20 })],
                                }),
                                new Paragraph({
                                  children: [
                                    new TextRun({
                                      text: skill.status,
                                      italics: true,
                                      size: 18,
                                      color: '666666',
                                    }),
                                  ],
                                }),
                              ],
                              20,
                            ),
                            createCell([new Paragraph(`${skill.confidenceScore}/10`)], 15),
                            createCell(
                              [
                                new Paragraph({
                                  children: [
                                    new TextRun({
                                      text: skill.evidenceFromCV,
                                      size: 20,
                                    }),
                                  ],
                                }),
                              ],
                              40,
                            ),
                          ],
                        }),
                    ),
                  ],
                }),
              ]
            : []),

          // === 4. EXPERIENCE RELEVANCE ===
          ...(expRelevance
            ? [
                createSectionHeader(t('experience.title')),

                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  layout: TableLayoutType.FIXED,
                  columnWidths: [2500, 2000, 1500, 4000],
                  rows: [
                    new TableRow({
                      tableHeader: true,
                      height: { value: 400, rule: HeightRule.ATLEAST },
                      children: ['Job title', 'Company', 'Score', 'Comment'].map(
                        (text) =>
                          new TableCell({
                            width: { size: 25, type: WidthType.PERCENTAGE },
                            shading: { fill: 'E7E6E6', type: ShadingType.CLEAR, color: 'auto' },
                            children: [
                              new Paragraph({ children: [new TextRun({ text, bold: true })] }),
                            ],
                            verticalAlign: VerticalAlign.CENTER,
                            margins: { top: 100, bottom: 100, left: 100, right: 100 },
                          }),
                      ),
                    }),
                    ...expRelevance.jobs.map(
                      (job) =>
                        new TableRow({
                          children: [
                            createCell(
                              [
                                new Paragraph({
                                  children: [new TextRun({ text: job.jobTitle, bold: true })],
                                }),
                              ],
                              25,
                            ),
                            createCell(
                              [
                                new Paragraph({
                                  children: [new TextRun({ text: job.company, size: 20 })],
                                }),
                                new Paragraph({
                                  children: [
                                    new TextRun({
                                      text: job.period,
                                      italics: true,
                                      size: 18,
                                      color: '666666',
                                    }),
                                  ],
                                }),
                              ],
                              20,
                            ),
                            createCell([new Paragraph(`${job.relevanceToRoleScore}/10`)], 15),
                            createCell(
                              [
                                new Paragraph({
                                  children: [new TextRun({ text: job.comment, size: 20 })],
                                }),
                              ],
                              40,
                            ),
                          ],
                        }),
                    ),
                  ],
                }),
              ]
            : []),

          // === 5. RED_ FLAGS ===
          createSectionHeader(t('redFlags.title')),

          ...flags.flags.flatMap((flag) => {
            return [
              new Paragraph({
                heading: HeadingLevel.HEADING_3,
                children: [
                  new TextRun({
                    text: `• ${flag.concern} `,
                    color: '000000',
                    size: 22,
                  }),
                  new TextRun({
                    text: `(${flag.severity})`,
                    color: flag.severity === 'High' ? 'C00000' : '444444',
                    size: 22,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: flag.details,
                    size: 22,
                    bold: false,
                    color: '000000',
                  }),
                ],
                spacing: { after: 100 },
              }),
              createMarginBlock(),
            ];
          }),

          // === 6. IMPROVEMENT PLAN ===
          ...(isPlan
            ? [
                createSectionHeader(t('improvement.title')),

                new Paragraph({
                  text: `• ${t('improvement.summaryRewrite')}`,
                  heading: HeadingLevel.TITLE,
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: plan.summaryRewrite.suggestion,
                      size: 22,
                      bold: false,
                      color: '000000',
                    }),
                  ],
                  spacing: { after: 100 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `"${plan.summaryRewrite.example}"`,
                      italics: false,
                      bold: false,
                      color: '000000',
                      size: 22,
                    }),
                  ],
                  indent: { left: 360 },
                  spacing: { after: 300 },
                }),

                createMarginBlock(),

                ...planKeywordOptimization,

                ...(isPlanKeywordOptimization ? [createMarginBlock()] : []),

                new Paragraph({
                  text: `• ${t('improvement.quantifyAchievements')}`,
                  heading: HeadingLevel.TITLE,
                }),
                new Paragraph({
                  text: plan.quantifyAchievements.suggestion,
                  spacing: { after: 100 },
                }),
                ...plan.quantifyAchievements.examplesToImprove.map(
                  (ex) =>
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `• "${ex}"`,
                          italics: false,
                          bold: false,
                          color: '000000',
                          size: 22,
                        }),
                      ],
                      indent: { left: 360 },
                      spacing: { after: 100 },
                    }),
                ),
              ]
            : []),

          // === 7. INTERVIEW QUESTIONS ===
          ...(questions
            ? [
                createSectionHeader(t('questions.title')),
                ...questions.questions.flatMap((q, index) => {
                  return [
                    // Question
                    new Paragraph({
                      heading: HeadingLevel.TITLE,
                      children: [
                        new TextRun({
                          text: `${index + 1}. ${q.question}`,
                          size: 22,
                          color: '000000',
                          bold: false,
                        }),
                      ],
                    }),
                    new Paragraph({
                      children: [
                        // Description
                        new TextRun({
                          text: `Why ask: `,
                          color: '000000',
                          size: 22,
                        }),
                        new TextRun({
                          text: `${q.reason}`,
                          color: '000000',
                          size: 22,
                          bold: false,
                        }),
                      ],

                      spacing: { before: 100, after: 200 },
                      indent: { left: 360 },
                    }),
                    createMarginBlock(),
                  ];
                }),
              ]
            : []),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, 'CV_Report.docx');
};
