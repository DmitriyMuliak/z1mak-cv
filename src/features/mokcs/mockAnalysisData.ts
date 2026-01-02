import { AnalysisSchemaType } from '../schema/analysisSchema';

export const mockAnalysisData: AnalysisSchemaType = {
  analysisTimestamp: '2024-07-26T10:00:00Z',
  overallAnalysis: {
    matchScore: 85,
    independentCvScore: 80,
    independentTechCvScore: 90,
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
  metadata: {
    isValidCv: true,
    isValidJobDescription: true,
    isJobDescriptionPresent: true,
  },
};

export const mockEmptyAnalysisData = {
  analysisTimestamp: '2024-04-10T10:00:00Z',
  overallAnalysis: {
    matchScore: 0.0,
    candidateLevel: 'Junior',
    suitabilitySummary:
      'Резюме містить лише випадковий набір символів і не містить жодної релевантної інформації про досвід роботи, навички чи освіту кандидата. Відповідно, кандидат абсолютно не відповідає жодним вимогам вакансії.',
    jobTargetLevel: 'Senior',
    levelMatch: false,
    educationMatch: false,
    jobHoppingFlag: false,
  },
  quantitativeMetrics: {
    totalYearsInCV: 0.0,
    relevantYearsInCV: 0.0,
    requiredYearsInJob: 0.0,
    keySkillCoveragePercent: 0.0,
    stackRecencyScore: 0.0,
    softSkillsScore: 0.0,
  },
  redFlagsAndConcerns: {
    title: 'Червоні прапорці та занепокоєння',
    flags: [
      {
        concern: 'Неповна інформація в резюме',
        details:
          "Резюме містить лише випадковий набір символів ('adsadsad'), що унеможливлює будь-який аналіз досвіду, навичок чи освіти кандидата.",
        severity: 'High',
      },
      {
        concern: 'Невідповідність вакансії',
        details: "Наданий текст резюме не має жодного відношення до вимог вакансії ('asdsad').",
        severity: 'High',
      },
    ],
  },
  actionableImprovementPlan: {
    title: 'План дій для покращення',
    summaryRewrite: {
      suggestion:
        'Необхідно надати повне та структуроване резюме, що описує досвід роботи, навички, освіту та досягнення кандидата.',
      example:
        "Наприклад: 'Досвідчений Senior Backend Developer з 8+ роками досвіду у розробці масштабованих веб-додатків на Node.js. Глибокі знання SQL, NoSQL баз даних (PostgreSQL, MongoDB), хмарних технологій (AWS, Docker, Kubernetes) та досвід роботи з CI/CD.'",
    },
    quantifyAchievements: {
      targetSection: 'Досвід роботи',
      suggestion:
        "Надати конкретні приклади досягнень з кількісними показниками (наприклад, 'зменшив час завантаження на 30%', 'збільшив конверсію на 15%').",
      examplesToImprove: [
        "Надати опис обов'язків та досягнень для кожної попередньої посади.",
        'Використовувати дієслова дії та цифри для опису результатів роботи.',
      ],
    },
    removeIrrelevant: {
      suggestion:
        'Видалити будь-який нерелевантний або випадковий текст, який не стосується професійного досвіду.',
    },
    keywordOptimization: {
      missingKeywords: [
        'Node.js',
        'Express.js',
        'RESTful APIs',
        'Microservices',
        'AWS',
        'Docker',
        'Kubernetes',
        'PostgreSQL',
        'MongoDB',
        'Git',
        'CI/CD',
        'Agile',
        'Scrum',
        'Problem-solving',
        'Teamwork',
        'Communication',
      ],
      suggestion:
        "Додати ключові слова, що відповідають вимогам вакансії, особливо щодо технологічного стеку (Node.js, Express.js, бази даних, хмарні сервіси, інструменти розробки) та м'яких навичок.",
    },
  },
  detailedSkillAnalysis: {
    title: 'Детальний аналіз навичок',
    skills: [
      {
        skill: 'Node.js',
        type: 'Required',
        status: 'Missing',
        evidenceFromCV: 'N/A',
        confidenceScore: 0.0,
      },
      {
        skill: 'Express.js',
        type: 'Required',
        status: 'Missing',
        evidenceFromCV: 'N/A',
        confidenceScore: 0.0,
      },
      {
        skill: 'RESTful APIs',
        type: 'Required',
        status: 'Missing',
        evidenceFromCV: 'N/A',
        confidenceScore: 0.0,
      },
      {
        skill: 'Microservices',
        type: 'Required',
        status: 'Missing',
        evidenceFromCV: 'N/A',
        confidenceScore: 0.0,
      },
      {
        skill: 'AWS',
        type: 'Required',
        status: 'Missing',
        evidenceFromCV: 'N/A',
        confidenceScore: 0.0,
      },
      {
        skill: 'Docker',
        type: 'Required',
        status: 'Missing',
        evidenceFromCV: 'N/A',
        confidenceScore: 0.0,
      },
      {
        skill: 'Kubernetes',
        type: 'Required',
        status: 'Missing',
        evidenceFromCV: 'N/A',
        confidenceScore: 0.0,
      },
      {
        skill: 'PostgreSQL',
        type: 'Required',
        status: 'Missing',
        evidenceFromCV: 'N/A',
        confidenceScore: 0.0,
      },
      {
        skill: 'MongoDB',
        type: 'Required',
        status: 'Missing',
        evidenceFromCV: 'N/A',
        confidenceScore: 0.0,
      },
      {
        skill: 'Git',
        type: 'Required',
        status: 'Missing',
        evidenceFromCV: 'N/A',
        confidenceScore: 0.0,
      },
      {
        skill: 'CI/CD',
        type: 'Required',
        status: 'Missing',
        evidenceFromCV: 'N/A',
        confidenceScore: 0.0,
      },
      {
        skill: 'Agile',
        type: 'Required',
        status: 'Missing',
        evidenceFromCV: 'N/A',
        confidenceScore: 0.0,
      },
      {
        skill: 'Scrum',
        type: 'Required',
        status: 'Missing',
        evidenceFromCV: 'N/A',
        confidenceScore: 0.0,
      },
      {
        skill: 'Problem-solving',
        type: 'Desired',
        status: 'Missing',
        evidenceFromCV: 'N/A',
        confidenceScore: 0.0,
      },
      {
        skill: 'Teamwork',
        type: 'Desired',
        status: 'Missing',
        evidenceFromCV: 'N/A',
        confidenceScore: 0.0,
      },
      {
        skill: 'Communication',
        type: 'Desired',
        status: 'Missing',
        evidenceFromCV: 'N/A',
        confidenceScore: 0.0,
      },
    ],
  },
  suggestedInterviewQuestions: {
    title: 'Рекомендовані запитання для співбесіди',
    questions: [
      {
        question:
          'Будь ласка, розкажіть про свій досвід роботи з Node.js та якими фреймворками ви користувалися?',
        reason: 'Перевірити наявність базових знань у ключовій технології.',
      },
      {
        question:
          'Які бази даних ви використовували у своїх попередніх проектах і чому ви обирали саме їх?',
        reason: 'Оцінити досвід роботи з базами даних, згаданими у вакансії.',
      },
      {
        question:
          'Чи маєте ви досвід роботи з хмарними платформами, такими як AWS, та інструментами контейнеризації, як Docker?',
        reason: "З'ясувати досвід роботи з інфраструктурними технологіями.",
      },
      {
        question:
          'Опишіть проект, де ви працювали в команді за методологією Agile/Scrum. Якою була ваша роль та внесок?',
        reason:
          'Перевірити розуміння та досвід роботи в командному середовищі за гнучкими методологіями.',
      },
    ],
  },
  experienceRelevanceAnalysis: {
    title: 'Аналіз релевантності досвіду',
    jobs: [],
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

export const mockDataToAnakyze2 = {
  cvText:
    'Personal information : \nName: Dmytro Muliak\nDate of birth: 07.11.94\nPhone number: +38-063-416-9909\nObjective: Software engineer\n\nSummary : \nMy official work experience started over 10 years ago, since then I have had experience working in full stack and front-end positions. I was able to work with real enthusiasts in their field and take part in the development of applications that have millions of users. The most interesting projects that I started or in which I took part is :\n - Professional investment tool, a market place, gathering in one single space: financial institutions, asset managers, qualified/accredited investors and investment advisors. \n- Mobile applications of parcel delivery network, and project for managing parcels in warehouses based on React native and GCP.\n - Payments/checkout infrastructure/flows with more than 100 payments methods and 180 million users. Sites with payment methods about 3 millions. Now I am looking for a team where I can apply my skills in designing, developing quality and scalable user interface.\n\nEducation : \nUkrainian National Forestry University, Master, foreign economic activity (2012 - 2018) \n\nTechnical skills : \nTechnologies, methodologies, specifications, principles, paradigms: \nHTML(5), CSS(3+), BEM, Ecmascript(5+), HTTP, CORS, AJAX, REST, WebSocket, GOF, OOP, FP, SOLID, GRASP, KISS, YAGNI, DRY etc. \n\nLanguages and libraries: \nJS, React, React-native, MobX, Mobx-state-tree, Redux, ReduxORM, Redux-saga, Redux-thunk/form, TypeScript, Flow, Firebase, React-router, React-navigation, Reselect, Recompose, Styled Components, Lodash, StoryBook, Jest, Pupeteer, React-testing-library, Enzym, ESLint, Prettier, Babel etc.\n\nHave experience with: \nVue.js, RxJs, Node.js, NextJs, MongoDB, Mongose, Docker, Redis etc. \n\nHTML, CSS Frameworks, preprocessors: Bootstrap(3,4), Sass, Less, CSS modules, Jade(Pug), Ant-Design, Material-ui, TailwindCss\n\nDevelopment Tools: Git, Gulp, Webpack, Bower, NPM, Yarn, VS Code, Chrome dev tools, RN debugger\n\nHave experience with agile methodologies: Scrum, Kanban\n\nSoft skills: persistent, involved, self-critical, responsibility\n\nLanguage skills: Ukrainian: native, English: upper-intermediate \n\n\nExperience : \nNov. 2021 - Apr 2024 \nPosition: Software engineer (FED - front-end developer) \nCompany: WIX \nTech Stack: React, TypeScript, Mobx, Redux, Redux-toolkit, Pupeteer, Jest, React-testing-library, Enzyme, Storybook, Css modules, Webpack, ESLint, Prettier, Yarn, NPM, Node.js (BFF), Express.js, grafana, lambda fnc, payment providers (payPal, googlePay, applePay, square, stripe .etc )\n\nMay. 2021 - Oct. 2021 \nPosition: Front-end developer \nCompany: Israel IT Tech Stack: React, React-native, Vue, TypeScript, Mobx-state-tree, normalizr, Materialui,StoryBook, Styled Components, ESLint, Jest, etc.\n\nNov. 2020 - Apr. 2021 \nPosition: Software engineer \nCompany: IntellectSoft Tech Stack: React, TypeScript, MobX, Mobx-state-tree, PDF-Tron, Material-ui, React-router, StoryBook, StyledComponents, ESLint, Prettier, etc. \n\nSep. 2019 - Oct. 2020 \nPosition: Front-end developer \nCompany: GTM - Global Tech Makers \nTech Stack: React, TypeScript, Redux, Material-ui, React-router, RxJs, Redux-thunk, Redux-Form, StoryBook, Styled Components, Jest, Babel, Node.js, MongoDB, Docker, etc. \n\nDec. 2018 - Sep. 2019 \nPosition: Software Engineer \nCompany: ELEKS Tech Stack: React-Native, Firebase, Redux, Redux-ORM, React-navigation, Redux-thunk, TypeScript, Reselect, Recompose, Lodash, Moment.js, Redux-Form, ESLint, Prettier, RN debugger, Babel, FP, etc. \n\nMar. 2018 - Dec. 2018 \nPosition: Front-end developer \nCompany: N-iX \nTech Stack: Vue, React, Redux, Redux-Saga, Redux-Form, Flow, React-Router, Reselect, Recompose, Styled Components, Ant-Design, WebSocket, Jest, ESLint, Prettier, Yarn, Webpack, Babel, moment.js, REST, Sass, BEM etc. \n\nApr. 2017 - Mar. 2018 \nPosition: Front-end developer (Jquery, moment.js, Leaflet, Less, Sass, Jade (Pug), Bower, Gulp, Webpack, Vue.js) \n\nDec. 2014 - Feb. 2017 \nPosition: Full-stack developer (PHP, MySQL, Wordpress, WP Genesis, Redis, JavaScript, Sass)',

  jobText:
    'Sr FrontEnd (React) продуктова компанія\n\nStafnear\n·  Підписатись\nЗберегти\n Сховати\nШукаємо інженера, який буде розвивати окремий фронтенд-застосунок, що під’єднується до бекенду зовнішньої системи через API. Рішення вже працює в продакшені, оновлення виходять регулярно (щотижневі релізи). \n\nОсновні пріоритети - швидкодія, якість UI, чистота та підтримуваність коду. \n\n \n\nЗадачі на проекті\n\nРозроблятимете й підтримуватимете кастомний FrontEnd, який інтегрується з BackEnd сервісами партнера.\nСтворюватимете та розширюватимете UI-компоненти на React / TypeScript / Tailwind CSS.\nДодаватимете SSR у Remix там, де це дає відчутний виграш (перфоманс/SEO/UX).\nПрацюватимете в тісній зв’язці з BackEnd, дизайнером і PM.\nСлідкуватимете за продуктивністю, стабільністю та масштабованістю фронтенду.\nБратимете участь у плануванні задач і підтримці ритму щотижневих релізів.\nДолучатиметесь до обговорення архітектури та покращення фронтенд-практик у команді.\n\n \n\nХто потрібен\n\nReact 6+ років комерційного досвіду.\nTypeScript  3+ роки.\nTailwind CSS 1+ рік практики.\nРозуміння сучасних підходів у FrontEnd і принципів SSR.\nДосвід інтеграції фронтенду з API та бекенд-сервісами.\nКомфортна робота в Scrum процесі.\n \n\nБуде перевагою\n\nПрактичний досвід з Remix або Next.js у SSR-застосунках.\nЗнання Jest і загальних підходів до тестування FrontEnd.\nДосвід із shadcn/ui або подібними компонентними бібліотеками.\nРеальні кейси оптимізації продуктивності (рендеринг, завантаження, метрики).\n \n\nВимоги до володіння мовами\nАнглійська\tB1 – Середній\nПро компанію Stafnear\nStafnear helps teams scale by adding individual engineers or full teams (Middle+ / Senior / Lead) — and we can also take',
};

export const mockDataAnakyzeResult2 = {
  analysisTimestamp: '2024-07-30T12:00:00Z',
  overallAnalysis: {
    candidateLevel: 'Senior',
    suitabilitySummary:
      'Кандидат має значний досвід роботи з React та TypeScript, що перевищує вимоги вакансії щодо років досвіду. Однак, відсутність досвіду з Tailwind CSS, який є обов\'язковою вимогою, є критичним недоліком. Також викликає занепокоєння часта зміна місць роботи, що може свідчити про "job hopping". Досвід з SSR (Remix/Next.js) є, але його глибина та актуальність потребують уточнення.',
    jobTargetLevel: 'Senior',
    levelMatch: true,
    educationMatch: true,
    jobHoppingFlag: true,
    independentTechCvScore: 55,
    matchScore: 68,
  },
  quantitativeMetrics: {
    totalYearsInCV: 9.4,
    requiredYearsInJob: 6,
    stackRecencyScore: 70,
    softSkillsScore: 60,
    keySkillCoveragePercent: 75,
    relevantYearsInCV: 6.1,
  },
  redFlagsAndConcerns: {
    title: 'Виявлені недоліки та занепокоєння',
    flags: [
      {
        concern: 'Job Hopping',
        details:
          'Кандидат має кілька коротких термінів роботи (6-12 місяців) в останніх компаніях, що може свідчити про нестабільність або швидку втрату інтересу до проектів.',
        severity: 'High',
      },
      {
        concern: "Відсутність обов'язкової навички",
        details:
          "Tailwind CSS є обов'язковою вимогою вакансії (1+ рік практики), але не згаданий у резюме кандидата.",
        severity: 'High',
      },
      {
        concern: 'Недостатня деталізація досвіду SSR',
        details:
          "Досвід з Next.js згаданий як 'have experience with', але немає конкретики щодо глибини роботи з SSR, а Remix взагалі не згаданий.",
        severity: 'Medium',
      },
      {
        concern: 'Відсутність кількісних досягнень',
        details:
          "Опис досвіду зосереджений на переліку технологій та обов'язків, без конкретних метрик або результатів, що демонструють вплив роботи кандидата.",
        severity: 'Medium',
      },
    ],
  },
  metadata: {
    isValidCv: true,
    isValidJobDescription: true,
    isJobDescriptionPresent: true,
  },
  actionableImprovementPlan: {
    title: 'План покращення резюме',
    summaryRewrite: {
      suggestion:
        "Перепишіть розділ 'Summary', щоб він був більш орієнтований на досягнення та відповідав вимогам вакансії, підкреслюючи ваш досвід у створенні високопродуктивних UI та інтеграції з бекенд-сервісами.",
      example:
        'Досвідчений Front-end інженер з 9+ роками розробки, включаючи 6+ років з React та TypeScript. Спеціалізуюся на створенні високопродуктивних та масштабованих UI, з досвідом інтеграції складних платіжних систем та мобільних додатків. Шукаю роль, де зможу застосувати свої навички у розробці якісних та підтримуваних користувацьких інтерфейсів.',
    },
    quantifyAchievements: {
      targetSection: 'Experience',
      suggestion:
        'Додайте кількісні показники до ваших досягнень, щоб продемонструвати вплив вашої роботи. Використовуйте цифри, відсотки та конкретні результати.',
      examplesToImprove: [
        'Payments/checkout infrastructure/flows with more than 100 payments methods and 180 million users.',
      ],
    },
    removeIrrelevant: {
      suggestion:
        'Розгляньте можливість скорочення або видалення дуже старого та менш релевантного досвіду (наприклад, PHP, MySQL, Wordpress), щоб зосередитись на основних навичках Front-end.',
    },
    keywordOptimization: {
      missingKeywords: ['Tailwind CSS', 'Remix', 'shadcn/ui', 'оптимізація продуктивності'],
      suggestion:
        'Додайте відсутні ключові слова з опису вакансії, особливо Tailwind CSS, та деталізуйте досвід з SSR (Remix/Next.js) та оптимізації продуктивності, якщо такий є.',
    },
  },
  detailedSkillAnalysis: {
    title: 'Детальний аналіз навичок',
    skills: [
      {
        skill: 'React',
        type: 'Required',
        status: 'Strongly Present',
        evidenceFromCV: 'WIX, Israel IT, IntellectSoft, GTM, ELEKS, N-iX',
        confidenceScore: 10,
      },
      {
        skill: 'TypeScript',
        type: 'Required',
        status: 'Strongly Present',
        evidenceFromCV: 'WIX, Israel IT, IntellectSoft, GTM, ELEKS',
        confidenceScore: 9,
      },
      {
        skill: 'Tailwind CSS',
        type: 'Required',
        status: 'Missing',
        evidenceFromCV: 'N/A',
        confidenceScore: 0,
      },
      {
        skill: 'API integration',
        type: 'Required',
        status: 'Strongly Present',
        evidenceFromCV: 'WIX, N-iX',
        confidenceScore: 9,
      },
      {
        skill: 'Scrum',
        type: 'Required',
        status: 'Mentioned',
        evidenceFromCV: 'N/A',
        confidenceScore: 7,
      },
      {
        skill: 'Jest',
        type: 'Desired',
        status: 'Strongly Present',
        evidenceFromCV: 'WIX, Israel IT, GTM, N-iX',
        confidenceScore: 8,
      },
      {
        skill: 'SSR (Next.js)',
        type: 'Desired',
        status: 'Mentioned',
        evidenceFromCV: 'GTM',
        confidenceScore: 4,
      },
    ],
  },
  suggestedInterviewQuestions: {
    title: 'Запропоновані питання для співбесіди',
    questions: [
      {
        question:
          'Розкажіть про ваш досвід роботи з Tailwind CSS. Які були ваші враження та чому він не згаданий у вашому резюме?',
        reason: "Tailwind CSS є обов'язковою вимогою вакансії, але відсутній у резюме кандидата.",
      },
      {
        question:
          'Ви маєте кілька коротких термінів роботи в останніх компаніях. Чи можете ви пояснити причини цих переходів?',
        reason:
          "Виявлено ознаки 'job hopping', що потребує уточнення мотивації та стабільності кандидата.",
      },
      {
        question:
          'Опишіть ваш найскладніший досвід оптимізації продуктивності Front-end застосунку. Які метрики ви використовували і яких результатів досягли?',
        reason:
          'Вакансія акцентує увагу на швидкодії та продуктивності, а в резюме відсутні кількісні показники досягнень.',
      },
      {
        question:
          "Ваш досвід з Next.js згаданий як 'have experience with'. Чи можете ви детальніше розповісти про ваш досвід з SSR, особливо в контексті Remix, якщо такий був?",
        reason:
          'Remix або Next.js у SSR-застосунках є перевагою, але глибина досвіду кандидата з SSR нечітка.',
      },
      {
        question:
          'Наведіть приклад, коли ви брали участь в обговоренні архітектури Front-end або покращенні практик у команді. Яка була ваша роль та вплив?',
        reason:
          'Вакансія передбачає участь в обговоренні архітектури та покращенні практик, необхідно оцінити лідерські якості та внесок кандидата.',
      },
    ],
  },
  experienceRelevanceAnalysis: {
    title: 'Аналіз релевантності досвіду',
    jobs: [
      {
        jobTitle: 'Software engineer (FED - front-end developer)',
        company: 'WIX',
        period: 'Nov. 2021 - Apr 2024',
        relevanceToRoleScore: 9,
        comment:
          'Висока релевантність завдяки актуальному досвіду з React, TypeScript, інтеграції платіжних систем та Node.js (BFF), що відповідає вимогам вакансії.',
      },
      {
        jobTitle: 'Front-end developer',
        company: 'Israel IT',
        period: 'May. 2021 - Oct. 2021',
        relevanceToRoleScore: 7,
        comment:
          'Релевантний досвід з React, React-native, TypeScript та іншими бібліотеками UI. Однак, короткий термін роботи є занепокоєнням.',
      },
      {
        jobTitle: 'Software engineer',
        company: 'IntellectSoft',
        period: 'Nov. 2020 - Apr. 2021',
        relevanceToRoleScore: 7,
        comment:
          'Релевантний досвід з React, TypeScript та MobX. Короткий термін роботи знижує загальну оцінку релевантності.',
      },
      {
        jobTitle: 'Front-end developer',
        company: 'GTM - Global Tech Makers',
        period: 'Sep. 2019 - Oct. 2020',
        relevanceToRoleScore: 8,
        comment:
          'Релевантний досвід з React, TypeScript, Redux та згадка Next.js, що є перевагою для вакансії.',
      },
      {
        jobTitle: 'Software Engineer',
        company: 'ELEKS',
        period: 'Dec. 2018 - Sep. 2019',
        relevanceToRoleScore: 6,
        comment:
          'Досвід з React-Native та TypeScript є релевантним, але фокус на мобільній розробці та короткий термін роботи роблять його менш пріоритетним.',
      },
    ],
  },
};
