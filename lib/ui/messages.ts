import { EMOJIS } from './emojis';

export const MESSAGES = {
  NO_ID_PASSED: `No id passed ${EMOJIS.EYES}`,
  COULD_NOT_FIND_FETCHER: 'Could not find the fetcher file: [file_path]',
  COULD_NOT_PARSE_FETCHER: 'Could not parse the output of your fetcher file.',
  COULD_NOT_CREATE_FILE: `Could not create file [path]. [error]`,
  ENTITIES_CREATED: `${EMOJIS.CHECK}  Basic entities created successfully.`,
  RC_FILE_NOT_FOUND: 'No .metristsrc file found  in [file_path]',
  COULD_NOT_READ_ENV_FILE: 'Could not read .env file',
  DEFAULT: `Something went wrong ${EMOJIS.POOP}`,
  PARSE_BOOK_EXCEPTION: `Could not validate parse book. [error]`,
  AUTHOR_NOT_SAVED: `${EMOJIS.SMIRK}  Trying to create avatar for an author that is not saved yet. [author]`,
  MISSING_PARAMETER: `Required parameters [parameters] are missing ${EMOJIS.EYES}`,
  WATCH_MODE_START: `Starting Metrists in watch mode...`,
};
