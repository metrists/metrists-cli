import { BaseException } from './base.exception';

export class AuthorNotSavedException extends BaseException {
  public override MESSAGE_TITLE = 'AUTHOR_NOT_SAVED' as const;
}
