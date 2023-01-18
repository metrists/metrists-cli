import { BaseException } from './base.exception';

export class MissingParamException extends BaseException {
  public MESSAGE_TITLE = 'MISSING_PARAMETER' as const;
}
