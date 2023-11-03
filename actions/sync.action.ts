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
export class SyncAction extends AbstractAction {
  public async handle({ options }) {
    const id = options.book ?? '13';

    const contextBook = await getOrCreateBook({
      id,
      status: 'pending',
    });
    try {
      const parsedStuff = await parseRdf(
        join(__dirname, '..', '..', 'data', 'rdf', id, `pg${id}.rdf`),
      );

      updateBook(contextBook._id, parsedStuff);

      const modifiedStuff = await applyModifiers([authorWikipediaModifier])(
        parsedStuff,
      );

      updateBook(contextBook._id, modifiedStuff);

      const tagsHash = await createTagsHash(
        join(__dirname, '..', '..', 'data', 'tag-hashmap.json'),
      );

      const createdStuff = await createBookEntities(modifiedStuff, tagsHash);

      console.log(createdStuff);
      console.log(chalk.green(MESSAGES.SYNC_SUCCESSFUL));
    } catch (e) {
      if (e instanceof BaseException) {
        //TODO: Report error more elegantly
        await reportError(contextBook._id, e.getMessage());
        console.error(chalk.red(e.getMessage()));
      } else {
        throw e;
      }
    }
  }
}
