declare module '*.css';

// This code can add typings for process.env
// But we prefer to use already checked variables with schema and get access for it by privatePrEnv || publicPrEnv

// import type { PrivateEnvSchemaType } from './utils/processEnv/private';
// import type { PublicEnvSchemaType } from './utils/processEnv/public';

// interface EnvSchemaType extends PrivateEnvSchemaType, PublicEnvSchemaType {}

// declare global {
//   namespace NodeJS {
//     // Extends `process.env` for IntelliSense throughout the project
//     // eslint-disable-next-line @typescript-eslint/no-empty-object-type
//     interface ProcessEnv extends EnvSchemaType {}
//   }
// }
