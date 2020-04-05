export interface FetcherResult {
  success: boolean;
  url: string;
  error?: string;
  children: string[];
}

export interface Fetcher {
  fetch(url: string, baseDomain: string): Promise<FetcherResult>;
}
