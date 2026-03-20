Нам потрібно обробляти івент коли бекенд вертає keep-alive замість івенту (описано в StreamingArhitecture.md) щоб браузер не закривав зєднання. Приклад stream який може віддавати endpoint -

: keep-alive // це окремий on('data')

```

: keep-alive

: keep-alive

id: 1773694834082-0
event: patch
data: {"ops":[{"op":"add","path":"/analysisTimestamp","value":"2024-07-30T12:00:00Z"}]}

id: 1773694834989-0
event: patch
data: {"ops":[{"op":"add","path":"/overallAnalysis","value":{"candidateLevel":"Senior","suitabilitySummary":"Кандидат є досвідченим Senior Frontend Engineer з понад 10 роками досвіду, що значно перевищує вимоги до Middle Full-Stack Engineer. Він демонструє глибокі знання React, Next.js та TypeScript, а також має досвід роботи з Node.js на бекенді. Однак, ключова вимога до Nest.js відсутня, що є значним пробілом для цієї вакансії. Також є ознаки частої зміни місць роботи.","jobTargetLevel":"Middle","levelMatch":false,"educationMatch":true,"jobHoppingFlag":true,"independentTechCvScore":88,"matchScore":56}}]}

id: 1773694835333-0
event: patch
data: {"ops":[{"op":"add","path":"/quantitativeMetrics","value":{"totalYearsInCV":9.33,"requiredYearsInJob":2,"stackRecencyScore":90,"softSkillsScore":85,"keySkillCoveragePercent":82,"relevantYearsInCV":7}}]}

id: 1773694836788-0
event: patch
data: {"ops":[{"op":"add","path":"/redFlagsAndConcerns","value":{"title":"Виявлені недоліки та занепокоєння","flags":[{"concern":"Невідповідність рівня","details":"Кандидат є Senior інженером з 10+ роками досвіду, тоді як вакансія розрахована на Middle Full-Stack Engineer з 2+ роками досвіду. Це може призвести до невідповідності очікувань щодо ролі та компенсації.","severity":"High"},{"concern":"Відсутність досвіду з Nest.js","details":"Nest.js є ключовою вимогою для бекенду в описі вакансії, але не згадується в резюме кандидата. Це є значним пробілом у технічному стеку.","severity":"High"},{"concern":"Часта зміна місць роботи (Job Hopping)","details":"Кандидат мав кілька коротких періодів роботи (менше 1.5 року) на останніх 3+ позиціях, що може свідчити про нестабільність або швидке вигорання.","severity":"Medium"},{"concern":"Недостатньо глибокий досвід з ORM","details":"У резюме не згадуються конкретні ORM (TypeORM, Prisma, Mongoose), які є бажаними в описі вакансії, хоча досвід роботи з базами даних присутній.","severity":"Low"}]}}]}

id: 1773694836954-0
event: patch
data: {"ops":[{"op":"add","path":"/metadata","value":{"isValidCv":true,"isValidJobDescription":true,"isJobDescriptionPresent":true}}]}

id: 1773694839310-0
event: patch
data: {"ops":[{"op":"add","path":"/actionableImprovementPlan","value":{"title":"План покращення резюме","summaryRewrite":{"suggestion":"Перепишіть розділ 'SUMMARY', щоб він краще відповідав вимогам вакансії Full-Stack, підкреслюючи досвід роботи з Node.js на бекенді та висловлюючи зацікавленість у вивченні/застосуванні Nest.js.","example":"Досвідчений Frontend Engineer з 10+ роками досвіду, який прагне розвиватися як Full-Stack розробник. Маю глибокі знання React, Next.js та TypeScript, а також значний досвід роботи з Node.js (Express.js) для побудови BFF та API. Готовий швидко освоїти Nest.js для створення масштабованих бекенд-систем."},"quantifyAchievements":{"targetSection":"PROFESSIONAL EXPERIENCE","suggestion":"Додайте кількісні показники до ваших досягнень, щоб продемонструвати реальний вплив вашої роботи. Використовуйте метод STAR (Situation, Task, Action, Result).","examplesToImprove":["Led migration from Enzyme to React Testing Library and expanded E2E coverage with Puppeteer, significantly reducing regressions in payment flows.","Built an internal warehouse scanning tool that improved parcel tracking workflows."]},"removeIrrelevant":{"suggestion":"Розгляньте можливість видалення або скорочення інформації про застарілий досвід (наприклад, PHP, WordPress з 2014-2018 років), оскільки він не є релевантним для цієї вакансії Full-Stack Engineer."},"keywordOptimization":{"missingKeywords":["Nest.js","TypeORM","Prisma","Mongoose","Kubernetes"],"suggestion":"Додайте відсутні ключові слова, особливо Nest.js, до розділу 'TECHNICAL SKILLS' або 'PROFESSIONAL EXPERIENCE', якщо ви маєте з ними досвід. Якщо досвіду немає, розгляньте можливість згадати про готовність їх вивчити."}}}]}

id: 1773694841364-0
event: patch
data: {"ops":[{"op":"add","path":"/detailedSkillAnalysis","value":{"title":"Детальний аналіз навичок","skills":[{"skill":"React.js","type":"Required","status":"Strongly Present","evidenceFromCV":"Wix, Israel IT, IntellectSoft, GTM, ELEKS, N-iX","confidenceScore":10},{"skill":"Next.js","type":"Required","status":"Strongly Present","evidenceFromCV":"Independent Software Engineer, AI CV Analyzer","confidenceScore":9},{"skill":"TypeScript","type":"Required","status":"Strongly Present","evidenceFromCV":"Independent Software Engineer, Wix, Israel IT, IntellectSoft, GTM, ELEKS, N-iX","confidenceScore":10},{"skill":"Node.js (Express.js)","type":"Required","status":"Strongly Present","evidenceFromCV":"Independent Software Engineer, Wix, Backend & Data","confidenceScore":9},{"skill":"Nest.js","type":"Required","status":"Missing","evidenceFromCV":"N/A","confidenceScore":0},{"skill":"Databases (SQL/NoSQL)","type":"Required","status":"Mentioned","evidenceFromCV":"Supabase (Auth / DB), MongoDB, AI CV Analyzer","confidenceScore":7},{"skill":"Web3 domain / Crypto exchanges","type":"Required","status":"Mentioned","evidenceFromCV":"Israel IT","confidenceScore":8}]}}]}

id: 1773694843587-0
event: patch
data: {"ops":[{"op":"add","path":"/suggestedInterviewQuestions","value":{"title":"Запропоновані питання для співбесіди","questions":[{"question":"Ваш досвід роботи з Nest.js не згадується в резюме. Чи мали ви можливість працювати з цим фреймворком або іншими подібними (наприклад, Angular на бекенді)? Як ви плануєте швидко освоїти Nest.js для цієї ролі?","reason":"Виявити прогалину в ключовому бекенд-стеку та оцінити готовність кандидата до навчання."},{"question":"Ви маєте значний досвід як Senior Frontend Engineer. Що мотивує вас розглядати позицію Middle Full-Stack Engineer, і як ви бачите свій внесок у команду на цьому рівні?","reason":"З'ясувати очікування кандидата щодо рівня ролі та його мотивацію, враховуючи невідповідність рівня."},{"question":"У вашому резюме є кілька коротких періодів роботи. Чи могли б ви пояснити причини цих переходів і як ви бачите свою довгострокову співпрацю з нашою компанією?","reason":"З'ясувати причини частої зміни місць роботи та оцінити стабільність кандидата."},{"question":"Ви згадували про розробку Admin Panel для криптобіржі в Israel IT. Чи могли б ви детальніше розповісти про ваш досвід у Web3 домені, зокрема про роботу з блокчейн-технологіями або специфічними аспектами торгових платформ?","reason":"Поглибити розуміння досвіду кандидата у Web3, оскільки це є вимогою вакансії."},{"question":"Опишіть ваш досвід роботи як Full-Stack розробника. Які були ваші обов'язки на бекенді, окрім BFF-шарів, і з якими базами даних та ORM ви працювали?","reason":"Оцінити глибину та широту досвіду кандидата як Full-Stack, оскільки більша частина його досвіду зосереджена на фронтенді."}]}}]}

id: 1773694846541-0
event: patch
data: {"ops":[{"op":"add","path":"/experienceRelevanceAnalysis","value":{"title":"Аналіз релевантності досвіду","jobs":[{"jobTitle":"Independent Software Engineer","company":"Freelance / Consulting & Personal SaaS Project","period":"Apr 2024 – Present","relevanceToRoleScore":9,"comment":"Висока релевантність, оскільки включає розробку full-stack SaaS-додатку (Next.js, Node.js, Redis, BullMQ) та технічний консалтинг з архітектури, що відповідає вимогам вакансії."},{"jobTitle":"Software Engineer — Core Checkout Team","company":"Wix","period":"Nov 2021 – Apr 2024","relevanceToRoleScore":8,"comment":"Висока релевантність завдяки роботі над місією-критичною FinTech платформою (React, Node.js BFF), фокусу на масштабованості, надійності та тестуванні, що є цінним для full-stack ролі."},{"jobTitle":"Senior Frontend Developer","company":"Israel IT","period":"May 2021 – Oct 2021","relevanceToRoleScore":8,"comment":"Висока релевантність через архітектуру React-базованої Admin Panel для криптобіржі, що безпосередньо відповідає вимогам до досвіду з Web3/криптовалютними платформами."},{"jobTitle":"Senior Frontend Developer (Contract)","company":"IntellectSoft","period":"Nov 2020 – Apr 2021","relevanceToRoleScore":6,"comment":"Середня релевантність. Досвід з React, MobX-State-Tree та налаштуванням CI/CD є корисним, але не має прямого full-stack фокусу, як вимагає вакансія."},{"jobTitle":"Frontend Developer","company":"GTM — Global Tech Makers","period":"Sep 2019 – Oct 2020","relevanceToRoleScore":6,"comment":"Середня релевантність. Розробка UI компонентної бібліотеки та робота над інвестиційною платформою демонструють сильні фронтенд-навички, але без явного бекенд-компонента."}]}}]}

id: 1773694846981-0
event: done
data: {}


```
