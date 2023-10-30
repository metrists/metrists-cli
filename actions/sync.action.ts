import { join } from 'path';
import * as chalk from 'chalk';
import { AbstractAction } from './abstract.action';
import { BaseException } from '../exceptions/base.exception';
import { MESSAGES } from '../lib/ui/messages';
import { parseRdf } from '../lib/utils/parse-rdf/parse-rdf';
import { authorWikipediaModifier } from '../lib/modifiers/author-wikipedia-modifier';
import { applyModifiers } from '../lib/modifiers';
import { getAllBooks } from '../lib/db/book';
export class SyncAction extends AbstractAction {
  public async handle({ options }) {
    try {
      console.log(chalk.green(MESSAGES.SYNC_SUCCESSFUL));

      const id = options.book ?? '13';

      const parsedStuff = await parseRdf(
        join(__dirname, '..', '..', 'data', 'rdf', id, `pg${id}.rdf`),
      );

      const modifiedStuff = await applyModifiers([authorWikipediaModifier])(
        parsedStuff,
      );

      console.log(await getAllBooks());

      console.log(modifiedStuff);
    } catch (e) {
      if (e instanceof BaseException) {
        //TODO: Report error
        console.error(chalk.red(e.getMessage()));
      } else {
        throw e;
      }
    }
  }
}
