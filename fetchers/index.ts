import { github } from './github';
import type { LanguageDictionary } from '../interfaces/phrase.interface';
import type { RcFile } from '../interfaces/rc.interface';

export const builtInFetchers: Record<
  string,
  (params: RcFile['fetcherParams']) => Promise<LanguageDictionary | never>
> = {
  github,
};
