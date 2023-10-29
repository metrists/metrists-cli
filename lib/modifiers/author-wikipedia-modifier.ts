import axios from 'axios';
import { load } from 'cheerio';
import { ParsedAuthor, ParsedBook } from '@lib/utils/parse-rdf/parse-rdf';

async function scrapeAuthorInfo(wikipediaUrl): Promise<Partial<ParsedAuthor>> {
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

    const newProps: Partial<ParsedAuthor> = {};

    if (descriptionElement.length > 0) {
      // Extract and clean the description text
      let description = descriptionElement.text();

      // Remove reference markers like [1], [2], [a], [b], etc.
      description = description.replace(/\[\d+[a-zA-Z]*\]/g, '');

      // Remove content within parentheses that matches the specified pattern
      description = description.replace(/\([^)]*\.[a-zA-Z-]*[^)]*\)/g, '');

      // Replace line breaks and extra whitespace with single spaces
      description = description.replace(/[\r\n]+/g, ' ').trim();

      newProps.description = description;
    } else {
      console.error('No author description found on the page');
    }

    // document.querySelectorAll('#bodyContent img')[0]
    const imageUrl = $('#bodyContent img').eq(0).attr('src');
    if (imageUrl) {
      newProps.avatarUrl = imageUrl.replace(/^\/\//, 'https://');
    } else {
      console.error('No author image found on the page');
    }

    return newProps;
  } catch (error) {
    console.error('An error occurred while scraping:', error.message);
    return {};
  }
}

export const authorWikipediaModifier = async (
  parsedBook: ParsedBook,
): Promise<ParsedBook> => {
  const copiedBook = { ...parsedBook };
  copiedBook.authors = await Promise.all(
    parsedBook.authors.map(async (author) => {
      if (author.wikipedia && (!author.description || !author.avatarUrl)) {
        const { description, avatarUrl } = await scrapeAuthorInfo(
          author.wikipedia,
        );
        if (!author.description) {
          author.description = description;
        }
        if (!author.avatarUrl) {
          author.avatarUrl = avatarUrl;
        }
      }
      return author;
    }),
  );

  return copiedBook;
};
