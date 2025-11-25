import { AnalysisSchemaType } from '../schema/analysisSchema';
import type { Paragraph as ParagraphType } from 'docx';

export const generateAndDownloadDocxReport = async (data: AnalysisSchemaType) => {
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

  const createProgressBarText = (percent: number) => {
    const totalBlocks = 15;
    const filledBlocks = Math.round((percent / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;
    const bar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
    return `${bar} ${percent}%`;
  };

  const createSectionHeader = (text: string) => {
    return new Paragraph({
      text: text,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, space: 1, color: 'auto' },
      },
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
                    text: 'Powered by DM AI CV Analyzer',
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
            text: 'CV Analysis Report',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `Generated on: ${new Date(data.analysisTimestamp).toLocaleString()}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            style: 'Subtitle',
          }),

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
                      new Paragraph({ text: 'Match Score', heading: HeadingLevel.HEADING_3 }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${oa.matchScore}/100`,
                            bold: true,
                            size: 48,
                            color: '2E75B6',
                          }),
                        ],
                        spacing: { after: 200 },
                      }),
                      new Paragraph({ text: oa.suitabilitySummary }),
                    ],
                    50,
                  ),

                  createCell(
                    [
                      new Paragraph({
                        text: 'Overall Assessment',
                        heading: HeadingLevel.HEADING_3,
                      }),
                      createLabelValue('Candidate Level', oa.candidateLevel),
                      createLabelValue('Target Level', oa.jobTargetLevel),
                      createLabelValue('Level Match', oa.levelMatch ? 'Yes' : 'No'),
                      createLabelValue('Education Match', oa.educationMatch ? 'Yes' : 'No'),
                      createLabelValue('Job Hopping', oa.jobHoppingFlag ? 'Yes' : 'No'),
                    ],
                    50,
                  ),
                ],
              }),
            ],
          }),

          // === 2. METRICS TABLE ===
          createSectionHeader('Quantitative Metrics'),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            columnWidths: [4000, 6000],
            rows: [
              new TableRow({
                children: [
                  createCell(
                    [
                      new Paragraph({ text: 'Experience', heading: HeadingLevel.HEADING_3 }),
                      createLabelValue('Total Years', qm.totalYearsInCV),
                      createLabelValue('Relevant Years', qm.relevantYearsInCV),
                      createLabelValue('Required Years', qm.requiredYearsInJob),
                    ],
                    40,
                  ),

                  createCell(
                    [
                      new Paragraph({ text: 'Scores', heading: HeadingLevel.HEADING_3 }),
                      new Paragraph({
                        children: [new TextRun({ text: 'Key Skills: ', bold: true })],
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

                      new Paragraph({
                        children: [new TextRun({ text: 'Stack Recency: ', bold: true })],
                        spacing: { after: 50 },
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: createProgressBarText(
                              data.quantitativeMetrics?.stackRecencyScore || 0,
                            ),
                            font: 'Courier New',
                          }),
                        ],
                        spacing: { after: 150 },
                      }),

                      new Paragraph({
                        children: [new TextRun({ text: 'Soft Skills: ', bold: true })],
                        spacing: { after: 50 },
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: createProgressBarText(
                              data.quantitativeMetrics?.softSkillsScore || 0,
                            ),
                            font: 'Courier New',
                          }),
                        ],
                      }),
                    ],
                    60,
                  ),
                ],
              }),
            ],
          }),

          // === 3. DETAILED SKILLS ===
          createSectionHeader(dsa.title),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            columnWidths: [2500, 2000, 1500, 4000],
            rows: [
              new TableRow({
                tableHeader: true,
                height: { value: 400, rule: HeightRule.ATLEAST },
                children: ['Skill', 'Type/Status', 'Score', 'Evidence'].map(
                  (text) =>
                    new TableCell({
                      width: { size: 25, type: WidthType.PERCENTAGE },
                      shading: { fill: 'E7E6E6', type: ShadingType.CLEAR, color: 'auto' },
                      children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
                      verticalAlign: VerticalAlign.CENTER,
                      margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    }),
                ),
              }),
              ...dsa.skills.map(
                (skill) =>
                  new TableRow({
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
                            children: [new TextRun({ text: skill.evidenceFromCV, size: 20 })],
                          }),
                        ],
                        40,
                      ),
                    ],
                  }),
              ),
            ],
          }),

          // === 4. RED_ FLAGS ===
          createSectionHeader(flags.title),

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

          // === 5. IMPROVEMENT PLAN ===
          createSectionHeader(plan.title),

          new Paragraph({ text: '1. Summary Rewrite', heading: HeadingLevel.TITLE }),
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
            indent: { left: 720 },
            spacing: { after: 300 },
          }),

          createMarginBlock(),

          new Paragraph({ text: '2. Missing Keywords', heading: HeadingLevel.TITLE }),
          new Paragraph({
            children: [
              new TextRun({
                text: plan.keywordOptimization.missingKeywords.join(', ') || 'None',
                color: '000000',
                bold: false,
                italics: false,
              }),
            ],
            spacing: { after: 300 },
          }),

          createMarginBlock(),

          new Paragraph({ text: '3. Quantify Achievements', heading: HeadingLevel.TITLE }),
          new Paragraph({ text: plan.quantifyAchievements.suggestion, spacing: { after: 100 } }),
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
                indent: { left: 720 },
                spacing: { after: 100 },
              }),
          ),

          // === 6. INTERVIEW QUESTIONS ===
          createSectionHeader(questions.title),
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
                indent: { left: 720 },
              }),
              createMarginBlock(),
            ];
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, 'CV_Report.docx');
};
