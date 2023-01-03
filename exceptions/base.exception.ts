import { Exception } from '../interfaces/exception.interface';
import { MESSAGES } from '../lib/ui';

export abstract class BaseException extends Error implements Exception {
  MESSAGE_TITLE = 'DEFAULT' as keyof typeof MESSAGES;
  private substitutions?: Record<string, string> = {};

  constructor(substitutions?: Record<string, string>) {
    super();
    if (substitutions) {
      this.substitutions = substitutions;
    }
  }

  getMessage() {
    let message = MESSAGES[this.MESSAGE_TITLE];
    const substitutions = this.getSubstitutions();

    Object.values(substitutions).forEach(
      ([key, value]) => (message = message.replace(`[${key}]`, value)),
    );

    return message;
  }

  getSubstitutions() {
    return this.substitutions;
  }
}
