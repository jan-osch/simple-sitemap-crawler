export interface Crawl {
  id: string;
  baseUrl: string;
  domain: string;
  done: boolean;
}

export interface CrawlResult {
  url: string;
  success: boolean;
}

export interface CrawlProgress {
  crawlId: string;
  currentUrl?: string;
  totalCrawled: number;
  done: boolean;
}

export type CrawlProgressCallback = (data: CrawlProgress) => any;

export interface CrawlService {
  startCrawl(baseUrl: string): Promise<Crawl>;

  getCrawlResults(
    id: string,
    take: number,
    skip: number
  ): Promise<CrawlResult[]>;

  onCrawlProgress(callback: CrawlProgressCallback): void;

  offCrawlProgress(callback: CrawlProgressCallback): void;

  findById(id: string): Promise<Crawl>;
}

export const CRAWL_SERVICE_KEY = "CRAWL_SERVICE";
