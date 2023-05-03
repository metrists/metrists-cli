import { BaseException } from './base.exception';

export class RcNotFound extends BaseException {
  public override MESSAGE_TITLE = 'RC_FILE_NOT_FOUND' as const;
}
