import path from 'path';

const buildEslintCommand = (filenames) => {
  return   `next lint --fix --file ${filenames
  .map((f) => path.relative(process.cwd(), f))
  .join(' --file ')}`;
}

const lintStagedConfig = {
  '*.{js,jsx,ts,tsx,mjs,json}': [buildEslintCommand],
};

export default lintStagedConfig;
