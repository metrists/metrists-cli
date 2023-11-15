import { join } from 'path';
import * as chalk from 'chalk';
import { AbstractAction } from './abstract.action';
import { BaseException } from '../exceptions/base.exception';
import { MESSAGES } from '../lib/ui/messages';
import { parseRdf } from '../lib/utils/parse-rdf/parse-rdf';
import { authorWikipediaModifier } from '../lib/modifiers/author-wikipedia-modifier';
import { applyModifiers } from '../lib/modifiers';
import { createTagsHash } from '../lib/utils/create-tags-hash/create-tags-hash';
import { createBookEntities } from '../lib/utils/create-entities/create-entities';
import { getOrCreateBook, reportError, updateBook } from '../context/context';
import { downloadFiles } from '../lib/utils/download-files/download-files';
import { convertBookToMarkdown } from '../lib/utils/convert-to-markdown/convert-to-markdown';
export class SyncAction extends AbstractAction {
  public async handle({ options }) {
    const id = options.book;

    if (!id) {
      console.log(chalk.red(MESSAGES.NO_ID_PASSED));
      return;
    } else if (id.includes(',')) {
      const ids = id.split(',');
      for (const id of ids) {
        await this.processBook({ id });
      }
      return;
    } else if (id.includes('-')) {
      const [start, end] = id.split('-');
      for (let i = parseInt(start); i <= parseInt(end); i++) {
        await this.processBook({ id: i.toString() });
      }
      return;
    } else {
      await this.processBook({ id });
    }
  }

  protected async processBook({ id }) {
    let contextBook = await getOrCreateBook({
      id,
    });

    try {
      const parsedStuff = await parseRdf(
        join(__dirname, '..', '..', 'data', 'rdf', id, `pg${id}.rdf`),
      );

      contextBook = await updateBook(contextBook._id, parsedStuff);

      const modifiedStuff = await applyModifiers([authorWikipediaModifier])(
        parsedStuff,
      );

      contextBook = await updateBook(contextBook._id, modifiedStuff);

      const tagsHash = await createTagsHash(
        join(__dirname, '..', '..', 'data', 'tag-hashmap.json'),
      );

      const createdStuff = await createBookEntities(
        modifiedStuff,
        tagsHash,
        contextBook,
      );

      console.log(createdStuff);
      console.log(
        chalk.green(`Book #${id}`),
        chalk.green(MESSAGES.ENTITIES_CREATED),
      );

      const { authorPaths, coverPath, htmlPath } = await downloadFiles(
        join(__dirname, '..', '..', '.cache'),
        parsedStuff,
        contextBook,
      );

      console.log({ authorPaths, coverPath, htmlPath });

      const dividedIntoChapters = await convertBookToMarkdown(
        htmlPath,
        parsedStuff,
      );

      console.log(dividedIntoChapters);

      return;
    } catch (e) {
      if (e instanceof BaseException) {
        //TODO: Report error more elegantly
        await reportError(contextBook._id, e.getMessage());
        console.error(chalk.red(e.getMessage()));
      } else {
        console.error(chalk.red(e.message));
      }
    }
  }
}
