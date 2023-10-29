import { BaseException } from './base.exception';

export class ParseBookException extends BaseException {
  public MESSAGE_TITLE = 'PARSE_BOOK_EXCEPTION' as const;
}
