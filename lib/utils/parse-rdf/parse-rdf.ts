import { XMLParser } from '../../xml-parser/xml-parser';
import { readFile } from 'fs/promises';
import axios from 'axios';
import { load } from 'cheerio';

export interface ParsedAuthor {
  name: string;
  dob?: string;
  id: string;
  wikipedia?: string;
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
  htmlFileAddress: string;
  rights?: string;
  description?: string;
  published?: string;
  publisher?: string;
}

export const parseRdf = async (filePath: string): Promise<ParsedBook> => {
  const fileString = await readFile(filePath, 'utf-8');

  const parser = new XMLParser(fileString);

  return {
    id: parseBookId(parser),
    authors: await parseAuthors(parser),
    rights: parseBookRights(parser),
    tags: parseTags(parser),
    title: parseBookTitle(parser),
    description: parseBookDescription(parser),
    publisher: parseBookPublisher(parser),
    published: parseBookIssued(parser),
    htmlFileAddress: parseBookHtmlAddress(parser),
  };
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

      let description = null;

      if (wikipediaUrl) {
        description = await scrapeAuthorDescription(wikipediaUrl);
      }

      const id = wikipedia ? wikipedia : parser.getFirstValue(author, './name');

      return {
        name: parser.getFirstValue(author, './name'),
        dob: parser.getFirstValue(author, './birthdate'),
        id: makeValueIntoId(id),
        wikipedia: wikipediaUrl,
        description,
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

async function scrapeAuthorDescription(wikipediaUrl) {
  try {
    // Fetch the Wikipedia page content
    const response = await axios.get(wikipediaUrl);
    const html = response.data;

    // Load the HTML content into Cheerio
    const $ = load(html);

    // Find the element with the author's description
    const descriptionElement = $('p')
      .filter((i, el) => $(el).text().trim().length > 0)
      .first();

    if (descriptionElement.length > 0) {
      // Extract and clean the description text
      let descriptionText = descriptionElement.text();

      // Remove reference markers like [1], [2], [a], [b], etc.
      descriptionText = descriptionText.replace(/\[\d+[a-zA-Z]*\]/g, '');

      // Remove content within parentheses that matches the specified pattern
      descriptionText = descriptionText.replace(
        /\([^)]*\.[a-zA-Z-]*[^)]*\)/g,
        '',
      );

      // Replace line breaks and extra whitespace with single spaces
      descriptionText = descriptionText.replace(/[\r\n]+/g, ' ').trim();

      return descriptionText;
    } else {
      console.error('No author description found on the page');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while scraping:', error.message);
    return null;
  }
}
