import { XMLParser } from '../../xml-parser/xml-parser';
import { readFile } from 'fs/promises';

interface Quad {
  termType: 'Quad';
  value: string;
  subject: NamedNode;
  predicate: NamedNode;
  object: NamedNode;
  graph: DefaultGraph;
}

interface NamedNode {
  termType: 'NamedNode';
  value: string;
}

interface DefaultGraph {
  termType: 'DefaultGraph';
  value: string;
}

export interface ParsedAuthor {
  name: string;
  dob?: string;
  id: string;
  wikipedia?: string;
}

export interface ParsedTag {
  id;
}

export interface ParsedBook {
  id: string;
  authors: ParsedAuthor[];
  title: string;
  htmlFileAddress: string;
  rights?: string;
  description?: string;
  published?: string;
  publisher?: string;
}

export const readRdf = async (
  filePath: string,
  baseIRI: string,
): Promise<any> => {
  return await readFile(filePath, 'utf-8');
};

export const parseRdf = async (filePath: string) => {
  const fileString = await readRdf(filePath, 'http://gutenberg.org/');

  const parser = new XMLParser(fileString);

  return parser.getFirstValue(null, '//creator/agent/name');
};
