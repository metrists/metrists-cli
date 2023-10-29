// import { ParseBookException } from '@exceptions/parse-book.exception';
import { XMLParser } from '../../xml-parser/xml-parser';
import { readFile } from 'fs/promises';

import * as z from 'zod';

export const ParsedAuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  dob: z.string().optional(),
  wikipedia: z.string().optional(),
  avatarUrl: z.string().optional(),
  description: z.string().optional(),
});

export const ParsedTagSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const ParsedBookSchema = z.object({
  id: z.string(),
  authors: z.array(ParsedAuthorSchema),
  tags: z.array(ParsedTagSchema),
  title: z.string(),
  htmlUrl: z.string(),
  rights: z.string().optional(),
  description: z.string().optional(),
  published: z.string().optional(),
  publisher: z.string().optional(),
});

export interface ParsedAuthor {
  name: string;
  dob?: string;
  id: string;
  wikipedia?: string;
  avatarUrl?: string;
  description?: string;
}

export interface ParsedTag {
  id: string;
  name: string;
}

export interface ParsedBook {
  id: string;
  authors: ParsedAuthor[];
  tags: ParsedTag[];
  title: string;
  htmlUrl: string;
  rights?: string;
  description?: string;
  published?: string;
  publisher?: string;
}

export const parseRdf = async (filePath: string): Promise<ParsedBook> => {
  const fileString = await readFile(filePath, 'utf-8');

  const parser = new XMLParser(fileString);

  const book = {
    id: parseBookId(parser),
    authors: await parseAuthors(parser),
    rights: parseBookRights(parser),
    tags: parseTags(parser),
    title: parseBookTitle(parser),
    description: parseBookDescription(parser),
    publisher: parseBookPublisher(parser),
    published: parseBookIssued(parser),
    htmlUrl: parseBookHtmlAddress(parser),
  };

  try {
    ParsedBookSchema.parse(book);
    return book;
  } catch (e) {
    throw new Error(e.message);
  }
};

const parseAuthors = async (parser: XMLParser): Promise<ParsedAuthor[]> => {
  const authors = parser.getAll(null, '//creator/agent');

  return Promise.all(
    authors.map(async (author) => {
      const webPageNode = parser.getFirst(author, './webpage');

      const wikipediaUrl = webPageNode?.attributes?.['rdf:resource'];

      let wikipedia: string | undefined;
      if (wikipediaUrl) {
        // Clean up the Wikipedia URL to extract the ID
        const wikipediaRegex =
          /https?:\/\/(?:www\.)?en\.wikipedia\.org\/wiki\/(.+)/;
        const match = wikipediaUrl.match(wikipediaRegex);
        if (match) {
          wikipedia = match[1];
        }
      }

      const id = wikipedia ? wikipedia : parser.getFirstValue(author, './name');

      return {
        name: parser.getFirstValue(author, './name'),
        dob: parser.getFirstValue(author, './birthdate'),
        id: makeValueIntoId(id),
        wikipedia: wikipediaUrl,
      };
    }),
  );
};

const parseTags = (parser: XMLParser): ParsedTag[] => {
  const allSubjects = parser.getAllValues(null, '//ebook/bookshelf');

  return allSubjects.map((item) => ({
    id: makeValueIntoId(cleanValue(item)),
    name: cleanValue(item),
  }));
};

const parseBookId = (parser: XMLParser): string => {
  const ebookNode = parser.getFirst(null, '//ebook');
  const rawId = ebookNode.attributes['rdf:about'];

  return rawId.replace('ebooks/', '');
};

const parseBookHtmlAddress = (parser: XMLParser): string | null => {
  const ebookHtmlNode = parser.getFirst(
    null,
    `//ebook/hasFormat/file[format/Description/value/text() = 'text/html']`,
  );
  if (!ebookHtmlNode) {
    return null;
  }
  return ebookHtmlNode.attributes['rdf:about'];
};

const parseBookRights = (parser: XMLParser): string => {
  return parser.getFirstValue(null, '//ebook/rights');
};

const parseBookTitle = (parser: XMLParser): string => {
  return cleanValue(parser.getFirstValue(null, '//ebook/title'));
};

const parseBookDescription = (parser: XMLParser): string => {
  return cleanValue(parser.getFirstValue(null, '//ebook/description'));
};

const parseBookPublisher = (parser: XMLParser): string => {
  return cleanValue(parser.getFirstValue(null, '//ebook/publisher'));
};

const parseBookIssued = (parser: XMLParser): string => {
  return cleanValue(parser.getFirstValue(null, '//ebook/issued'));
};

const cleanValue = (value: string) => {
  if (!value) {
    return '';
  }
  return value.replace(/[\n\t]/g, '').trim();
};

const makeValueIntoId = (value: string) => {
  if (!value) {
    return '';
  }

  return value
    .replace(/[\n\t]/g, '')
    .trim()
    .toLowerCase()
    .replace('_', '-')
    .replace(/[^a-zA-Z0-9 -]/g, '')
    .replace(/ /g, '-');
};
