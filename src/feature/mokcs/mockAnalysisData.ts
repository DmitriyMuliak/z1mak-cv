import { AnalysisSchemaType } from '../schema/analysisSchema';

export const mockAnalysisData: AnalysisSchemaType = {
  analysisTimestamp: '2024-07-26T10:00:00Z',
  overallAnalysis: {
    matchScore: 85,
    candidateLevel: 'Senior',
    jobTargetLevel: 'Senior',
    levelMatch: true,
    educationMatch: false,
    jobHoppingFlag: false,
    suitabilitySummary:
      'Dmytro is a strong candidate for the Senior React Engineer role, demonstrating extensive experience in React, TypeScript, and related frontend technologies. His background in FinTech and high-traffic environments, coupled with a recent focus on backend development, aligns well with the job requirements. While he meets most qualifications, further probing into specific React Hooks usage and CI/CD depth would be beneficial.',
  },
  quantitativeMetrics: {
    totalYearsInCV: 10.5,
    relevantYearsInCV: 7.5,
    requiredYearsInJob: 5,
    keySkillCoveragePercent: 90,
    stackRecencyScore: 55,
    softSkillsScore: 67,
  },
  detailedSkillAnalysis: {
    title: 'Detailed Skill Analysis',
    skills: [
      {
        skill: 'React.js',
        type: 'Required',
        status: 'Strongly Present',
        evidenceFromCV: 'Senior Full Stack Engineer (React / Node.js)',
        confidenceScore: 10,
      },
      {
        skill: 'JavaScript',
        type: 'Required',
        status: 'Strongly Present',
        evidenceFromCV: 'Core: TypeScript, JavaScript (ES6+)',
        confidenceScore: 10,
      },
      {
        skill: 'React Hooks',
        type: 'Required',
        status: 'Mentioned',
        evidenceFromCV:
          'Frontend: React, Redux (Toolkit, Saga), MobX (State Tree), React Query, TailwindCSS, Styled Components, Material-UI.',
        confidenceScore: 7,
      },
      {
        skill: 'Typescript',
        type: 'Required',
        status: 'Strongly Present',
        evidenceFromCV: 'Core: TypeScript, JavaScript (ES6+)',
        confidenceScore: 10,
      },
      {
        skill: 'Next.js',
        type: 'Required',
        status: 'Strongly Present',
        evidenceFromCV: 'Core: TypeScript, Node.js, Next.js, HTML5, CSS3.',
        confidenceScore: 9,
      },
      {
        skill: 'TailwindCSS',
        type: 'Required',
        status: 'Strongly Present',
        evidenceFromCV:
          'Frontend: React, Redux (Toolkit, Saga), MobX (State Tree), React Query, TailwindCSS, Styled Components, Material-UI.',
        confidenceScore: 9,
      },
      {
        skill: 'TanStack Query',
        type: 'Required',
        status: 'Mentioned',
        evidenceFromCV:
          'Frontend: React, Redux (Toolkit, Saga), MobX (State Tree), React Query, TailwindCSS, Styled Components, Material-UI.',
        confidenceScore: 8,
      },
      {
        skill: 'TanStack Table',
        type: 'Required',
        status: 'Missing',
        evidenceFromCV: 'N/A',
        confidenceScore: 0,
      },
      {
        skill: 'Radix-UI',
        type: 'Required',
        status: 'Missing',
        evidenceFromCV: 'N/A',
        confidenceScore: 0,
      },
      {
        skill: 'React Testing Library',
        type: 'Desired',
        status: 'Strongly Present',
        evidenceFromCV: 'Testing: Jest, React Testing Library (RTL), Puppeteer, E2E Testing.',
        confidenceScore: 9,
      },
      {
        skill: 'Jest',
        type: 'Desired',
        status: 'Strongly Present',
        evidenceFromCV: 'Testing: Jest, React Testing Library (RTL), Puppeteer, E2E Testing.',
        confidenceScore: 9,
      },
      {
        skill: 'Storybook',
        type: 'Desired',
        status: 'Missing',
        evidenceFromCV: 'N/A',
        confidenceScore: 0,
      },
      {
        skill: 'App and browser performance',
        type: 'Required',
        status: 'Strongly Present',
        evidenceFromCV:
          'Concepts: OOP, SOLID, Micro-frontends (BFF pattern), Web Vitals optimization.',
        confidenceScore: 8,
      },
      {
        skill: 'English',
        type: 'Required',
        status: 'Mentioned',
        evidenceFromCV: 'LANGUAGES English: Intermediate (Professional Working Proficiency)',
        confidenceScore: 6,
      },
      {
        skill: 'CI concepts',
        type: 'Required',
        status: 'Strongly Present',
        evidenceFromCV: 'Tools & Infra: Git, Webpack, CI/CD, Grafana, Sentry.',
        confidenceScore: 8,
      },
      {
        skill: 'Node.js',
        type: 'Desired',
        status: 'Strongly Present',
        evidenceFromCV: 'Core: TypeScript, JavaScript (ES6+), Node.js, Next.js, HTML5, CSS3.',
        confidenceScore: 9,
      },
    ],
  },
  experienceRelevanceAnalysis: {
    title: 'Experience Relevance Analysis',
    jobs: [
      {
        jobTitle: 'Independent Software Engineer / Career Sabbatical',
        company: 'Self-Employed',
        period: 'Apr 2024 – Present',
        relevanceToRoleScore: 7,
        comment:
          "While this period is marked as a sabbatical, the candidate actively engaged in upskilling, focusing on backend systems (NestJS, PostgreSQL, Message Queues) and full-stack development (Next.js). This demonstrates initiative and a proactive approach to expanding skills relevant to a full-stack role, though it's not direct professional experience in the target role.",
      },
      {
        jobTitle: 'Software Engineer (Core Checkout Team)',
        company: 'WIX',
        period: 'Nov 2021 – Apr 2024',
        relevanceToRoleScore: 10,
        comment:
          'Highly relevant experience. Developed critical checkout infrastructure for a large e-commerce platform, involving high-traffic environments, FinTech integrations, and frontend performance optimization. Experience with Node.js BFF and migrating test suites to RTL/Puppeteer directly aligns with the job requirements.',
      },
      {
        jobTitle: 'Senior Front-end Developer',
        company: 'Israel IT',
        period: 'May 2021 – Oct 2021',
        relevanceToRoleScore: 8,
        comment:
          'Relevant experience in leading frontend architecture for a Crypto Exchange platform. Mentorship experience is a plus for a senior role. The duration is short, but the impact seems significant.',
      },
      {
        jobTitle: 'Senior Front-end Developer (Contract)',
        company: 'IntellectSoft',
        period: 'Nov 2020 – Apr 2021',
        relevanceToRoleScore: 8,
        comment:
          'Relevant experience in designing SPA architecture from scratch, setting up CI pipelines, and delivering complex features. Demonstrates ability to establish standards and deliver on challenging projects.',
      },
      {
        jobTitle: 'Front-end Developer',
        company: 'GTM - Global Tech Makers',
        period: 'Sep 2019 – Oct 2020',
        relevanceToRoleScore: 7,
        comment:
          'Experience in developing a UI component library and leading migration to TypeScript is valuable. Shows understanding of code quality and standardization.',
      },
      {
        jobTitle: 'Software Engineer',
        company: 'ELEKS',
        period: 'Dec 2018 – Sep 2019',
        relevanceToRoleScore: 6,
        comment:
          'Experience with React Native and Firebase is relevant for broader full-stack understanding, though less directly applicable to the core React role. Proactive development of internal tools shows initiative.',
      },
      {
        jobTitle: 'Front-end Developer',
        company: 'N-iX',
        period: 'Mar 2018 – Dec 2018',
        relevanceToRoleScore: 5,
        comment:
          'Initial enterprise experience with Vue.js and React. Demonstrates foundational frontend skills but is less impactful compared to later roles.',
      },
      {
        jobTitle: 'Full-stack / Front-end Developer',
        company: 'Web Studio & Freelance',
        period: 'Dec 2014 – Mar 2018',
        relevanceToRoleScore: 4,
        comment:
          'Early career experience in web development, including PHP and WordPress. Shows a progression towards modern frontend technologies but is less relevant for a senior React role.',
      },
    ],
  },
  redFlagsAndConcerns: {
    title: 'Red Flags and Concerns',
    flags: [
      {
        concern: 'Missing Required Skills',
        details:
          'The candidate is missing explicit experience with TanStack Table and Radix-UI, which are listed as required skills in the job description. While they have experience with React Query (TanStack Query), the specific table component and UI library are not mentioned.',
        severity: 'Medium',
      },
      {
        concern: 'English Proficiency',
        details:
          "The CV lists English as 'Intermediate (Professional Working Proficiency)', while the job description requires 'Upper-intermediate level of spoken and written English'. This could be a potential mismatch.",
        severity: 'Medium',
      },
      {
        concern: 'Sabbatical Period',
        details:
          'The candidate took a planned career break from April 2024 to Present. While they used this time for upskilling, the gap in direct professional employment might require further explanation.',
        severity: 'Low',
      },
      {
        concern: 'Education Mismatch',
        details:
          "The candidate's Master's Degree is in 'Foreign Economic Activity', which is not directly related to Computer Science or a technical field. While experience is paramount, this might be a minor point of discussion.",
        severity: 'Low',
      },
    ],
  },
  actionableImprovementPlan: {
    title: 'Actionable Improvement Plan',
    summaryRewrite: {
      suggestion:
        'The current summary is good but could be more concise and directly highlight the alignment with the Senior React Engineer role. Emphasize full-stack capabilities and specific achievements relevant to AdTech/MarTech if possible.',
      example:
        'Product-oriented Senior Software Engineer with 10+ years of experience, specializing in building high-performance Frontend architectures (React/TypeScript) and recently expanding into Backend development (Node.js/NestJS). Proven ability to deliver complete Full Stack solutions, with critical checkout flows used by 3M+ merchants. Seeking to leverage expertise in React and modern web technologies to contribute to groundbreaking web applications at Star.',
    },
    keywordOptimization: {
      missingKeywords: ['TanStack Table', 'Radix-UI', 'AdTech', 'MarTech'],
      suggestion:
        "Incorporate keywords like 'TanStack Table' and 'Radix-UI' if the candidate has any related experience, even if not explicitly listed. If they have worked on projects related to AdTech or MarTech, mentioning this would significantly improve relevance. If not, focus on transferable skills like high-traffic environments and performance optimization.",
    },
    quantifyAchievements: {
      targetSection: 'Professional Experience',
      suggestion:
        'Quantify achievements further where possible. For example, specify the percentage improvement in performance, reduction in bugs, or scale of systems managed.',
      examplesToImprove: [
        'Maintained and optimized Checkout Widgets operating in a High-Traffic environment. Ensured system stability and UI responsiveness during peak traffic events (e.g., Black Friday).',
        'Successfully integrated global payment providers (Google Pay, Stripe, Square) in a strict PCI-compliant environment.',
        'Migrated legacy test suite to React Testing Library and implemented Puppeteer E2E flows, significantly reducing regression bugs in critical payment paths.',
      ],
    },
    removeIrrelevant: {
      suggestion:
        "The 'Full-stack / Front-end Developer | Web Studio & Freelance' section could be condensed or removed if space is needed, as it represents early-career, less relevant experience. The education section, while present, is not technically relevant and could be de-emphasized.",
    },
  },
  suggestedInterviewQuestions: {
    title: 'Suggested Interview Questions',
    questions: [
      {
        question:
          "Can you describe your experience with React Hooks, specifically mentioning any complex custom hooks you've built or challenges you've overcome?",
        reason: 'To assess the depth of experience with React Hooks, which is a required skill.',
      },
      {
        question:
          "The job description lists TanStack Table and Radix-UI as required. Can you elaborate on any experience you have with these specific libraries, or similar ones, and how you've used them?",
        reason:
          "To probe into the missing required skills and understand the candidate's adaptability.",
      },
      {
        question:
          'How do you approach optimizing application and browser performance? Can you give an example of a performance bottleneck you identified and resolved?',
        reason:
          "To evaluate the candidate's understanding and practical application of performance optimization, a key requirement.",
      },
      {
        question:
          "You mentioned 'Intermediate' English proficiency. Can you describe a situation where you had to communicate complex technical information to non-technical stakeholders or clients in English?",
        reason:
          "To assess English communication skills against the 'Upper-intermediate' requirement.",
      },
      {
        question:
          'Can you walk us through your process for setting up CI/CD pipelines for a new project? What tools and concepts are you most familiar with?',
        reason: "To gauge the candidate's practical understanding of CI concepts.",
      },
      {
        question:
          'Tell me about your experience contributing to a Node.js BFF layer. What were the main challenges and benefits?',
        reason: "To explore the candidate's backend experience, which is a plus for the role.",
      },
    ],
  },
};
