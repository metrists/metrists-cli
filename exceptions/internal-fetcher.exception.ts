import { BaseException } from './base.exception';

export class InternalFetcherException extends BaseException {
  public MESSAGE_TITLE = 'INTERNAL_FETCHER_ERROR' as const;
}
