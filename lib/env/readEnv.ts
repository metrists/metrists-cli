import { promises as fs, existsSync } from 'fs';
import { MESSAGES } from '../ui/messages';
import { join } from 'path';
import { ReadEnvException } from '../../exceptions/read-env.exception';
import * as dotenv from 'dotenv';

const doesEnvFileExist = (envPath: string) => {
  return existsSync(envPath);
};

export const readEnv = async (envPath = join(process.cwd(), '.env')) => {
  let finalEnv = process.env;
  if (doesEnvFileExist(envPath)) {
    try {
      const envFileBuffer = await fs.readFile(envPath);
      const envFileContent = dotenv.parse(envFileBuffer);
      finalEnv = { ...finalEnv, ...envFileContent };
    } catch (error) {
      throw new ReadEnvException();
    }
  }
  return finalEnv;
};
