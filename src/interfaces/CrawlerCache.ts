export interface CrawlerCache {
  visitIfPossible(crawlId: string, url: string): Promise<boolean>;

  notifyUrlStarted(crawlId: string, url: string): Promise<void>;

  notifyUrlDone(crawlId: string, url: string, success: boolean): Promise<void>;
}
