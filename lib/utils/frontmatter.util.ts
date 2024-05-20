import { dump } from 'js-yaml';
import { EOL } from 'os';

export const getFrontmatter = (frontmatter: Record<string, any> | Array<any>) => {
  return `---${EOL}${dump(frontmatter)}---${EOL}`;
};
