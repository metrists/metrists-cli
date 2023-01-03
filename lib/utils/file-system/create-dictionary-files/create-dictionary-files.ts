import { writeFile, mkdir, lstat } from 'fs/promises';
import * as path from 'path';
import { checkPathExists } from '../check-path-exists';
import { FileCreationException } from '../../../../exceptions/file-creation.exception';
import type { LanguageDictionary } from '../../../../interfaces/phrase.interface';

export const createDictionaryFiles = async (
  baseUrl: string,
  dict: LanguageDictionary,
) => {
  for (const [languageCode, language] of Object.entries(dict)) {
    // Create a directory for each language
    const languageDir = path.join(process.cwd(), baseUrl, languageCode);

    if (!(await checkPathExists(languageDir))) {
      await mkdir(languageDir, { recursive: true });
    }
    for (const [namespace, content] of Object.entries(language)) {
      const filePath = path.join(languageDir, `${namespace}.json`);
      try {
        // Create a file for each namespace within the language directory
        await writeFile(filePath, JSON.stringify(content));
      } catch (e) {
        throw new FileCreationException({
          file_path: filePath,
          error: e.message,
        });
      }
    }
  }
};
