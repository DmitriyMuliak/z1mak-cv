import fs from 'node:fs';
import path from 'node:path';

const main = () => {
  try {
    const rootDir = process.cwd();
    const commitFilePath = path.join(rootDir, '.git', 'COMMIT_EDITMSG');
    const commitMessageRaw = readCommitFile(commitFilePath);

    const parsed = parseCommitMessage(commitMessageRaw);
    const state = determineState(parsed);
    const validation = getValidationState(state);

    if (SKIP_FLAG_RE.test(commitMessageRaw)) {
      logger.passWithSkip(validation.isValid ? '' : validation.message);
      process.exitCode = 0;
      return;
    }

    if (!validation.isValid) {
      logger.fail(validation.message);
      process.exit(1);
    }

    const newMessage = formatCommitMessage(state);

    writeCommitFile(commitFilePath, newMessage);
    logger.pass();
    logger.info(`New message title: ${newMessage}`);
  } catch (err) {
    logger.fail(err.message);
    process.exit(1);
  }
};

const COLORS = {
  BG_RED: '\x1b[41m',
  RESET: '\x1b[0m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[38;5;191m',
  MAGENTA: '\x1b[35m',
};

// You can write all brackets by own but for what ?
// You only need type fix type 'fix' or 'refactor' .ect and Jira ticket number
// const Example  = "1. [FIX]: Some text";
// const Example1 = "2. (PROJ-123,PROJ-432,PROJ-1344):[FIX]: Some text";
// const Example2 = "3. (PROJ-123):[FIX]: Some text";
const EXAMPLES = [
  '123;fix;Commit message',
  '123,222,333;test;Commit message',
  'refactor;Commit message',
  'Commit message --skipMessageCheck',
  'Commit message --skipmessagecheck',
];

const COMMIT_TYPES = [
  'fix',
  'feat',
  'wip',
  'none',
  'chore',
  'change',
  'update',
  'refactor',
  'feature',
  'doc',
  'infra',
  'add',
  'test',
  'style',
];

const COMMIT_TYPE_RE = new RegExp(`^(${COMMIT_TYPES.join('|')})$`);
const JIRA_TAG = 'JIRA_TAG';
const SKIP_FLAG_RE = /--skipmessagecheck|--skipMessageCheck/;

const logger = {
  fail(errors) {
    console.log(
      COLORS.BG_RED,
      'Aborting commit: the commit message does not comply with conventional commits standard.',
      COLORS.RESET,
    );
    console.log(COLORS.GREEN, `\nExamples:\n${EXAMPLES.join('\n')}`, COLORS.RESET);
    console.log('Accepted commit types:', COMMIT_TYPES.join('|'));
    if (errors) {
      console.log('Errors:');
      console.log(errors);
    }
  },
  pass() {
    console.log(COLORS.MAGENTA, 'Your commit message is valid. 🚀🚀🚀', COLORS.RESET);
  },
  passWithSkip(message) {
    if (!message) return this.pass();
    console.log(
      COLORS.YELLOW,
      'Your commit message is not valid but passed because message linting was skipped. Fix ASAP.',
      COLORS.RESET,
    );
    console.log('Commit message linting error:');
    console.log(message);
  },
  info(msg) {
    console.log(COLORS.MAGENTA, msg, COLORS.RESET);
  },
};

const validators = {
  taskNumbers(value) {
    const ids = value
      .trim()
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (ids.length === 0) {
      return { isValid: false, message: "You didn't pass task id" };
    }
    const allNumeric = ids.every((id) => !Number.isNaN(Number(id)));
    return {
      isValid: allNumeric,
      message: allNumeric ? '' : 'Task references are not valid numbers.',
    };
  },

  commitType(value) {
    const formatted = value.trim();
    const ok = COMMIT_TYPE_RE.test(formatted);
    return {
      isValid: ok,
      message: ok
        ? ''
        : `You should pass commit type as second argument. Accepted type values: ${COMMIT_TYPES.join(',')}`,
    };
  },
};

const validateAll = (results) => {
  const failed = results.filter((r) => !r.isValid);
  if (failed.length === 0) return { isValid: true, message: '' };
  const message = failed.map((r, i) => `${i + 1}. ${r.message}`).join('\n');
  return { isValid: false, message };
};

const parseCommitMessage = (commitMessage) => {
  return commitMessage
    .trim()
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
};

const determineState = (parsed) => {
  const len = parsed.length;
  return {
    parsed,
    len,
    isLessThanTwoArgs: len < 2,
    isTwoArgs: len === 2,
    isThreeArgs: len === 3,
    isMoreThanThreeArgs: len > 3,
    isFirstArgCommitType: COMMIT_TYPE_RE.test(parsed[0] || ''),
  };
};

const getValidationState = (state) => {
  const {
    parsed,
    isLessThanTwoArgs,
    isTwoArgs,
    isThreeArgs,
    isFirstArgCommitType,
    isMoreThanThreeArgs,
  } = state;
  if (isLessThanTwoArgs) {
    return validateAll([{ isValid: false, message: 'There are no params divided by ";"' }]);
  }

  if (isTwoArgs && isFirstArgCommitType) {
    return validateAll([validators.commitType(parsed[0])]);
  }

  if (isTwoArgs && !isFirstArgCommitType) {
    return validateAll([
      { isValid: false, message: 'In case of 2 arguments the first one needs to be commit type' },
    ]);
  }

  if (isThreeArgs || isMoreThanThreeArgs) {
    return validateAll([validators.taskNumbers(parsed[0]), validators.commitType(parsed[1])]);
  }

  return { isValid: false, message: 'Unknown validation state' };
};

const formatCommitMessage = (state) => {
  const { parsed, isTwoArgs, isThreeArgs, isFirstArgCommitType, isMoreThanThreeArgs } = state;
  const body = parsed[parsed.length - 1].trim();

  const tasksBlock = () => {
    const ids = parsed[0]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return `(${ids.map((id) => `${JIRA_TAG}-${id}`).join(',')})`;
  };

  const typeBlock = (index = 1) => `[${parsed[index].trim().toUpperCase()}]`;

  // Case: "refactor;Commit message" -> [REFACTOR]: Some text
  if (isTwoArgs && isFirstArgCommitType) {
    return `${typeBlock(0)}: ${body}`;
  }

  // Case: "123;fix;Commit message" or "123,222;test;Commit message" -> (JIRA_TAG-123):[FIX]: Commit message
  if (isThreeArgs || isMoreThanThreeArgs) {
    return `${tasksBlock()}:${typeBlock()}: ${body}`;
  }

  return parsed.join(' ');
};

const readCommitFile = (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    throw new Error(`Failed to read commit message file: ${err.message}`);
  }
};

const writeCommitFile = (filePath, message) => {
  try {
    fs.writeFileSync(filePath, message, { encoding: 'utf-8' });
  } catch (err) {
    throw new Error(`Failed to write commit message file: ${err.message}`);
  }
};

main();
