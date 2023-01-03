import { MESSAGES } from '../lib/ui/messages';

export interface Exception {
  MESSAGE_TITLE: keyof typeof MESSAGES;
}
