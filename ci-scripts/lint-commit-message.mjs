import fs from 'node:fs';
import path from 'node:path';
// const argv = require('node:process');

const BGred = "\x1b[41m";
const reset = "\x1b[0m";
const green = "\x1b[32m";
const yellow = "\x1b[38;5;191m";
const magenta = "\x1b[35m";

// You can write all brackets by own but for what ?
// You only need type fix type 'fix' or 'refactor' .ect and Jira ticket number
// const Example  = "1. [FIX]: Some text";
// const Example1 = "2. (PROJ-123,PROJ-432,PROJ-1344):[FIX]: Some text";
// const Example2 = "3. (PROJ-123):[FIX]: Some text";

const Example1 = '123;fix;Commit message';
const Example2 = '123,222,333;test;Commit message';
const Example3 = 'refactor;Commit message';
const Example4 = 'Commit message --skipMessageCheck';
const Example5 = 'Commit message --skipmessagecheck';

const commitTypeRegExp = /fix|feat|wip|none|chore|change|update|refactor|doc|infra|add|test|style/;
const JIRA_TAG = 'JIRA_TAG';


const logFailedBuild = (errorMessage) => {
  console.log(BGred, "Aborting commit: the commit message doesn't comply with conventional commits standard.", reset);
  console.log(green, "\n Examples: \n", Example1, "\n", Example2, "\n", Example3, "\n", Example4, "\n", Example5, reset);
  console.log('Examples of commit type: fix|feat|wip|none|chore|change|update|refactor|doc|infra|add|test|style');
  errorMessage && console.log('Errors:');
  errorMessage && console.log(errorMessage);
}

const logSuccessBuild = () => {
  console.log(magenta, "Your commit message is valid. 🚀🚀🚀 ", reset);
}

const logSuccessBuildWithoutMessageConventional = (valid = true, message = '') => {
  if (valid) {
    return logSuccessBuild();
  }

  console.log(yellow, `Your commit message is not valid but it Passed because you are skipped message linting, please fix it ASAP.`, reset);
  message && console.log('Commit message linting error:');
  message && console.log(message);
}

const isMessageWithSkipOption = value => value.search(/--skipmessagecheck|--skipMessageCheck/) !== -1;

const checkTaskNumber = value => {
  const taskIds = value.trim().split(',').filter(item => !!item);

  if (!taskIds.length) {
    return {
      isValid: false,
      message: `You didn't pass task id`,
    }
  }

  let isValidNumbers = true;
  taskIds.forEach(item => isNaN(Number(item)) && (isValidNumbers = false));

  return {
    isValid: isValidNumbers,
    message: 'Task references are not valid numbers.',
  }
}

const checkTaskType = value => {
  const formattedValue = value.trim();

  if (formattedValue.search(commitTypeRegExp) === -1) {
    return {
      isValid: false,
      message: `You should pass commit type as second argument. ${'\n'}Accepted type values: ${String(commitTypeRegExp)}`,
    }
  }

  return {
    isValid: true,
    message: '',
  }
}

const validate = (tasks = []) => {

  if (tasks.every(data => data.isValid === true)) {
    return {
      isValid: true,
      message: ''
    }
  }

  let message = '';
  tasks.filter(data => data.isValid === false).forEach((data, index) => message += `${index + 1}. ${data.message}` + '\n');

  return {
    isValid: false,
    message,
  }
}

const getValidationState = (parsedCommitMessage, {
  isLessThanTwoArgs,
  isTwoArgs,
  isThreeArgs,
  isFirstArgIsTaskType,
}) => {
  if (isLessThanTwoArgs) {
    return validate([{ isValid: false, message: 'There are no params divided by ";"' }]);
  }

  if (isTwoArgs && isFirstArgIsTaskType) {
    return validate([checkTaskType(parsedCommitMessage[0])]);
  }

  if (isTwoArgs && !isFirstArgIsTaskType) {
    return validate([{ isValid: false, message: 'In case of 2 arguments the first one need to be commit type' }]);
  }

  if (isThreeArgs || isMoreThanThreeArgs) {
    return validate([checkTaskNumber(parsedCommitMessage[0]), checkTaskType(parsedCommitMessage[1])])
  }
}

const formatMessage = (parsedCommitMessage, { isTwoArgs, isThreeArgs, isFirstArgIsTaskType }) => {
  let result = '';
  const messageBody = `: ${parsedCommitMessage[parsedCommitMessage.length - 1].trim()}`;
  const getMessageWithTasksNumber = () => `[${parsedCommitMessage[0].trim().split(',').filter(v => !!v).map(taskNumber => `${JIRA_TAG}-${taskNumber}`).join(',')}]`;
  const getMessageWithCommitType = (index = 1) => `[${parsedCommitMessage[index].trim().toUpperCase()}]`;

  if (isTwoArgs && isFirstArgIsTaskType) {
    result = getMessageWithCommitType(0);
    result = result + messageBody;
    return result;
  }

  if (isThreeArgs || isMoreThanThreeArgs) {
    result = getMessageWithTasksNumber();
    result = result + getMessageWithCommitType();
    result = result + messageBody;
    return result;
  }

  return message;
}

const main = () => {
  const rootDir = process.cwd();
  const commitFilePath = path.join(rootDir, '.git', 'COMMIT_EDITMSG');
  const commitMessage = fs.readFileSync(commitFilePath, 'utf8');

  const parsedCommitMessage = commitMessage.trim().split(';').filter(v => !!v).filter(v => v !== '\n' || v !== '\t');
  const isLessThanTwoArgs = parsedCommitMessage.length < 2;
  const isTwoArgs = parsedCommitMessage.length === 2;
  const isThreeArgs = parsedCommitMessage.length === 3;
  const isMoreThanThreeArgs = parsedCommitMessage.length > 3;
  const isFirstArgIsTaskType = parsedCommitMessage[0].search(commitTypeRegExp) !== -1;

  const validationState = getValidationState(parsedCommitMessage, {
    isLessThanTwoArgs,
    isTwoArgs,
    isThreeArgs,
    isFirstArgIsTaskType,
    isMoreThanThreeArgs,
  });

  if (isMessageWithSkipOption(commitMessage)) {
    logSuccessBuildWithoutMessageConventional(validationState.isValid, validationState.message);
    return process.exitCode = 0;
  }

  if (!validationState.isValid) {
    logFailedBuild(validationState.message);
    return process.exit(1);
  }

  const formattedMessage = formatMessage(parsedCommitMessage, {
    isTwoArgs,
    isThreeArgs,
    isFirstArgIsTaskType,
  });
  fs.writeFileSync(commitFilePath, formattedMessage, { encoding: 'utf-8' });
  logSuccessBuild();
  console.log(magenta, `New message title: ${formattedMessage}`);
}

// print process.argv
// process.argv.forEach((val, index) => {
//   console.log(`${index}: ${val}`);
// });

main();