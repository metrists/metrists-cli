import { RcFile } from '../../interfaces/rc.interface';
import { readEnv } from '../env/readEnv';

export const resolveFetcherParamsWithEnv = async (
  fetcherParams: RcFile['fetcherParams'],
  envPath?: string,
): Promise<RcFile['fetcherParams']> => {
  let environment;

  if (
    Object.values(fetcherParams).some(
      (value) => typeof value === 'string' && value.startsWith('env.'),
    )
  ) {
    environment = await readEnv(envPath);
  }

  const results = Object.entries(fetcherParams).reduce(
    (transformedParams, [key, fetcherParamValue]) => {
      let fetcherParamCopy = fetcherParamValue;
      if (typeof fetcherParamValue === 'string') {
        if (fetcherParamValue.startsWith('env.')) {
          const paramWithoutEnv = fetcherParamValue.replace('env.', '');
          if (environment[paramWithoutEnv]) {
            fetcherParamCopy = environment[paramWithoutEnv];
          }
        }
      }
      transformedParams[key] = fetcherParamCopy;
      return transformedParams;
    },
    {},
  );

  return results;
};
