import { dump, load } from 'js-yaml';
import { EOL } from 'os';

export function serializeFrontmatter(
  frontmatter: Record<string, any> | Array<any>,
) {
  return `---${EOL}${dump(frontmatter)}---${EOL}`;
}

export function parseFrontmatter(content: string) {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  const match = content.match(frontmatterRegex);
  if (!match) {
    return null;
  }

  const frontmatter = match[1];

  return load(frontmatter);
}

export function replaceFrontmatter(
  content: string,
  frontmatter: Record<string, any> | Array<any>,
) {
  const frontmatterString = serializeFrontmatter(frontmatter);
  return content.replace(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/, frontmatterString);
}

export function hasFrontmatter(fileContent: string) {
  return fileContent.startsWith('---');
}
