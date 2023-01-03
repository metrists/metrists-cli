import { executeFetcher } from '../utils/execute-fetcher';
import { extractJson } from '../utils/extract-json';
import { builtInFetchers } from '../../fetchers';
import { resolveFetcherParamsWithEnv } from './resolve-fetcher-params-env';
import { ParseFetcherException } from '../../exceptions/parse-fetcher.exception';
import { InternalFetcherException } from '../../exceptions/internal-fetcher.exception';
import type { RcFile } from '../../interfaces/rc.interface';
import type { LanguageDictionary } from '../../interfaces/phrase.interface';

export const runFetcher = async (
  fetcher: RcFile['fetcher'],
  fetcherParams?: RcFile['fetcherParams'],
  envPath?: RcFile['envPath'],
): Promise<LanguageDictionary | never> => {
  if (builtInFetchers[fetcher]) {
    const fetcherParamsWithResolvedEnv = await resolveFetcherParamsWithEnv(
      fetcherParams,
      envPath,
    );
    try {
      return builtInFetchers[fetcher](fetcherParamsWithResolvedEnv);
    } catch (e) {
      throw new InternalFetcherException(e.message);
    }
  } else {
    const fetcherCommandRawOutput = await executeFetcher(fetcher);
    const extracted = extractJson(fetcherCommandRawOutput);
    if (extracted) {
      return extracted;
    }
  }
  throw new ParseFetcherException();
};
