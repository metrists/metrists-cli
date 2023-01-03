import { BaseException } from './base.exception';

export class FileCreationException extends BaseException {
  public MESSAGE_TITLE = 'COULD_NOT_CREATE_FILE' as const;
}
