import { BaseException } from './base.exception';

export class ParseFetcherException extends BaseException {
  public MESSAGE_TITLE = 'COULD_NOT_PARSE_FETCHER' as const;
}
