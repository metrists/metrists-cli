export interface RcFile {
  resolvePath?: string;
  fetcher?: string;
  fetcherParams?: Record<string, any>;
  envPath?: string;
}
