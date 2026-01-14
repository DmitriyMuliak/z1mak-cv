const config = {
  plugins: ['@tailwindcss/postcss'], // for next dev/build
};

export default config;

// import tailwindcss from '@tailwindcss/postcss';

// const isVitest =
//   process.env.VITEST === 'true' || typeof process.env.VITEST_WORKER_ID !== 'undefined';
// const config = {
//   plugins: isVitest
//     ? [tailwindcss()] // for vitest/vite
//     : ['@tailwindcss/postcss'], // for next dev/build
// };

// export default config;
