import { AbstractCommand } from './abstract.command';
import { getConfigGetter, type GetRcFieldValue } from '../lib/utils/rc.util';

export abstract class ConfigAwareCommand extends AbstractCommand {
  protected _getConfig: Awaited<ReturnType<typeof getConfigGetter>>;

  protected async loadConfig() {
    if (this.isConfigLoaded()) return;
    this._getConfig = await getConfigGetter(process.cwd());
  }

  protected isConfigLoaded() {
    return !!this._getConfig;
  }

  protected getConfig<TData>(cb: GetRcFieldValue<TData>, defaultValue?: TData) {
    if (!this._getConfig) {
      throw new Error('Config is not loaded. Please call loadConfig() before getConfig()');
    }

    return this._getConfig(cb, defaultValue);
  }
}
