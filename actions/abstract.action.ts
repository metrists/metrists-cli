export type AbstractActionPrams = {
  input?: string | boolean;
  options?: Record<string, any>;
};

export abstract class AbstractAction {
  public abstract handle(params?: AbstractActionPrams): Promise<void>;
}
