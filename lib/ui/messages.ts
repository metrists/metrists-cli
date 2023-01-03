import * as chalk from 'chalk';
import { EMOJIS } from './emojis';

export const MESSAGES = {
  COULD_NOT_FIND_FETCHER: 'Could not find the fetcher file: [file_path]',
  COULD_NOT_PARSE_FETCHER: 'Could not parse the output of your fetcher file.',
  COULD_NOT_CREATE_FILE: `Could not create file [file_path]. [error]`,
  SYNC_SUCCESSFUL: `${EMOJIS.CHECK}  Sync successful.`,
  RC_FILE_NOT_FOUND: 'No .metristsrc file found.',
  COULD_NOT_READ_ENV_FILE: 'Could not read .env file',
  DEFAULT: `Something went wrong ${EMOJIS.POOP}`,
  INTERNAL_FETCHER_ERROR: `Something went wrong ${EMOJIS.POOP}. [error]`,
  METRISTS_INFORMATION_PACKAGE_MANAGER_FAILED: `${EMOJIS.SMIRK}  cannot read your project package.json file, are you inside your project directory?`,
};
