import { getArbitraryMeta, getArbitraryChapter } from './content-layer.util';
import {
  serializeFrontmatter,
  parseFrontmatter,
  hasFrontmatter,
  replaceFrontmatter,
} from './frontmatter.util';
import {
  writeToFile,
  createFile,
  appendToFile,
  pathExists,
  readFile,
  combinePaths,
} from './fs.util';
import { sep } from 'path';

const META_FILE_NAME = 'meta.md';

export async function createOrModifyMetaFile(baseDir: string) {
  const metaFilePath = combinePaths([baseDir, META_FILE_NAME]);
  console.log({ metaFilePath });
  const directoryName = baseDir.split(sep).pop();
  console.log({ directoryName });
  const arbitraryMeta = getArbitraryMeta(directoryName);
  console.log({ arbitraryMeta });
  if (!pathExists(metaFilePath)) {
    return createFile(metaFilePath, serializeFrontmatter(arbitraryMeta));
  } else {
    //TODO: Can we stream the file? Do we need to read the whole file into memory?
    const fileContent = await readFile(metaFilePath);
    const isContainingFrontmatter = hasFrontmatter(fileContent);
    let newContent;
    if (isContainingFrontmatter) {
      newContent = replaceFrontmatter(fileContent, arbitraryMeta);
    } else {
      newContent = serializeFrontmatter(arbitraryMeta) + fileContent;
    }

    return await writeToFile(metaFilePath, newContent);
  }
}
