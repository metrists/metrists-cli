import { parse } from 'node-html-parser';
import { readFile } from 'fs/promises';
import { divideIntoSections } from '../break-into-chapters/break-into-chapters';
import { ParsedBook } from '../parse-rdf/parse-rdf';

export async function convertBookToMarkdown(
  path: string,
  parsedBook: ParsedBook,
) {
  const parentNode = await readAsHtml(path);

  const dividedBook = divideIntoSections(parentNode);

  return dividedBook;
}

export async function readAsHtml(path: string) {
  const fileContent = await readFile(path, 'utf-8');
  return parse(fileContent);
}
