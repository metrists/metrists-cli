import { join } from 'path';
import * as chalk from 'chalk';
import { AbstractAction } from './abstract.action';
import { clearContext } from '../context/context';
import { deleteAllEntities } from '../lib/utils/delete-entities/delete-entities';
import { deleteFiles } from '../lib/utils/delete-files/delete-files';
import { getIsDbLocal } from '../lib/db/db';
export class ResetAction extends AbstractAction {
  public async handle({ options }) {
    await deleteFiles(join(__dirname, '..', '..', '.cache'));
    console.info(chalk.green('✅ Deleted cache files'));
    if (options.force || getIsDbLocal()) {
      await deleteAllEntities();
      console.info(chalk.green('✅ Deleted all entities'));
      await clearContext();
      console.info(chalk.green('✅ Cleared context'));
      return;
    } else {
      console.warn(
        chalk.yellow(
          'Not deleting entities because db is not local. If you want to delete entities, pass the --force flag.',
        ),
      );
    }
  }
}
