import { existsSync, promises } from 'fs';
import { join } from 'path';
import * as chalk from 'chalk';
import { runFetcher } from '../lib/run-fetcher';
import { createDictionaryFiles } from '../lib/utils/file-system/create-dictionary-files';
import { AbstractAction } from './abstract.action';
import { BaseException } from '../exceptions/base.exception';
import { MESSAGES } from '../lib/ui/messages'
import { MissingParamException } from '../exceptions/missing-param.exception'
import type { RcFile } from '../interfaces/rc.interface';

export class SyncAction extends AbstractAction {
  public async handle({ options }) {
    try {
      const { fetcher, resolve, fetcherParams, envPath } = await this.resolveOptions(options);
      this.validateParams({ fetcher, resolve, fetcherParams, envPath })
      const output = await runFetcher(fetcher, fetcherParams, envPath); 
      await createDictionaryFiles(resolve, output) && console.log(chalk.green(MESSAGES.SYNC_SUCCESSFUL));
    } catch (e) {
      console.log('cathcing in handle')
      if (e instanceof BaseException) {
        console.error(chalk.red(e.getMessage()));
      } else {
        throw e;
      }
    }
  }

  async resolveOptions(options) {
    const rc = await this.getRCFile();

    return {
      fetcher: options?.fetcher ?? rc?.fetcher,
      resolve: options?.resolve ?? rc?.resolvePath,
      envPath: options?.env ?? rc?.envPath,
      fetcherParams: rc?.fetcherParams ?? {},
    };
  }

  async validateParams(options){
    const requiredParams = ['fetcher' , 'resolve'];
    const parameterErrors = requiredParams.reduce((paramErrors , currentParam) => {
      if(!options[currentParam]){
        if(paramErrors){
          return paramErrors += `, ${currentParam}`
        }else{
          return currentParam
        }
      }
    } , '')
    try{
      if(parameterErrors){
        throw new MissingParamException({ parameters : parameterErrors})
      }
    }catch(e){
      throw e
    }
  }

  async getRCFile(): Promise<RcFile> {
    const rcPath = join(process.cwd(), '.metristsrc');
    if (existsSync(rcPath)) {
      return JSON.parse(await promises.readFile(rcPath, 'utf8'));
    }
    return;
  }
}
