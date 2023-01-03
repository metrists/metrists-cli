import { BaseException } from './base.exception';

export class ReadEnvException extends BaseException {
  public override MESSAGE_TITLE = 'COULD_NOT_READ_ENV_FILE' as const;
}
