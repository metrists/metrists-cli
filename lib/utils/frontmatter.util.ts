import { dump, load } from 'js-yaml';
import { EOL } from 'os';

export function serializeFrontmatter(frontmatter: Record<string, any> | Array<any>) {
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
