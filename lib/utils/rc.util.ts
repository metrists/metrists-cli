import { readFileIfExists } from './fs.util';

export interface IRcFile {
  outDir?: string;
}

export const RC_FILE_NAME = '.metristsrc';

export async function readRcFile(basePath: string) {
  return readFileIfExists<IRcFile>(basePath, RC_FILE_NAME);
}
export type GetFieldValue<TData, TResult> = (data: TData) => TResult;

export function getRcPathGetter(basePath: string) {
  async function getConfig<TResult>(callback: GetFieldValue<IRcFile, TResult>): Promise<TResult>;

  async function getConfig<
    TResults extends Array<GetFieldValue<IRcFile, any>>,
    TResultTuple extends any[],
  >(callbacks: [...TResults]): Promise<{ [K in keyof TResults]: ReturnType<TResults[K]> }>;

  async function getConfig<TResults extends Array<GetFieldValue<IRcFile, any>>>(
    callbacks: TResults | GetFieldValue<IRcFile, any>,
  ): Promise<any> {
    const data = await readRcFile(basePath);
    if (typeof callbacks === 'function') {
      return callbacks(data);
    }

    return Promise.all(callbacks.map((callback) => callback(data))) as any;
  }

  return getConfig;
}
