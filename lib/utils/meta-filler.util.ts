import { getArbitraryMeta, getArbitraryChapter } from './content-layer.util';
import { serializeFrontmatter, parseFrontmatter } from './frontmatter.util';
import { performOnAllFilesInDirectory, createFile } from './fs.util';

export function createOrModifyMetaFile(baseDir: string) {
  const meta = getArbitraryMeta(baseDir);
  const metaFile = serializeFrontmatter(meta);
  const metaFilePath = `${baseDir}/meta.md`;
  createFile(metaFilePath, metaFile);
}
