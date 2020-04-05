import { v4 as uuidV4 } from "uuid";
import { EventEmitter } from "events";

import { CrawlerCache } from "../interfaces/CrawlerCache";
import {
  Crawl,
  CrawlProgress,
  CrawlProgressCallback,
  CrawlResult,
  CrawlService,
} from "../interfaces/CrawlService";
import { Queue } from "../interfaces/Queue";
import { getDomain } from "../utils/urlUtils";
import { CrawlerTask } from "../interfaces/CrawlerTask";

interface StoredResult {
  id: string;
  baseUrl: string;
  domain: string;
  done: boolean;

  crawledUrls: Set<string>;
  pendingUrls: Set<string>;

  urls: { url: string; success: boolean }[];
}

export class MemoryCrawlService implements CrawlerCache, CrawlService {
  private store: Map<string, StoredResult>;
  private emitter: EventEmitter;

  static ERRORS = {
    URL_NOT_PENDING: "URL_NOT_PENDING",
    URL_ALREADY_CRAWLED: "URL_ALREADY_CRAWLED",
    UNKNOWN_CRAWL: "UNKNOWN_CRAWL",
  };

  private static EVENTS = {
    PROGRESS: "PROGRESS",
  };

  constructor(private queue: Queue<CrawlerTask>) {
    this.store = new Map<string, StoredResult>();
    this.emitter = new EventEmitter();
  }

  async notifyUrlStarted(crawlId: string, currentUrl: string): Promise<void> {
    const storedResult = this.getStoredResults(crawlId);

    MemoryCrawlService.validateProgressUrl(storedResult, currentUrl);

    const crawlProgress: CrawlProgress = {
      currentUrl,
      crawlId,
      totalCrawled: storedResult.crawledUrls.size,
      done: storedResult.done,
    };

    this.notifyProgressHandlers(crawlProgress);
  }

  async notifyUrlDone(
    crawlId: string,
    url: string,
    success: boolean
  ): Promise<void> {
    const storedResult = this.getStoredResults(crawlId);

    MemoryCrawlService.validateProgressUrl(storedResult, url);

    storedResult.pendingUrls.delete(url);
    storedResult.crawledUrls.add(url);
    storedResult.urls.push({ url, success });

    this.checkCrawlDone(storedResult, crawlId);
  }

  async visitIfPossible(crawlId: string, url: string): Promise<boolean> {
    const storedResult = this.getStoredResults(crawlId);

    if (
      storedResult.crawledUrls.has(url) ||
      storedResult.pendingUrls.has(url)
    ) {
      return false;
    }

    storedResult.pendingUrls.add(url);
    return true;
  }

  onCrawlProgress(callback: CrawlProgressCallback) {
    this.emitter.on(MemoryCrawlService.EVENTS.PROGRESS, callback);
  }

  async findById(id: string): Promise<Crawl> {
    const storedResult = this.getStoredResults(id);

    return {
      id: storedResult.id,
      baseUrl: storedResult.baseUrl,
      domain: storedResult.domain,
      done: storedResult.pendingUrls.size === 0,
    };
  }

  offCrawlProgress(callback: CrawlProgressCallback) {
    this.emitter.off(MemoryCrawlService.EVENTS.PROGRESS, callback);
  }

  async startCrawl(baseUrl: string): Promise<Crawl> {
    const domain = getDomain(baseUrl);

    const storeEntry: StoredResult = {
      id: uuidV4(),
      baseUrl: baseUrl,
      domain: domain,
      done: false,

      crawledUrls: new Set<string>(),
      pendingUrls: new Set([baseUrl]),
      urls: [],
    };

    this.store.set(storeEntry.id, storeEntry);
    this.pushToQueue(storeEntry);

    return {
      id: storeEntry.id,
      baseUrl: storeEntry.baseUrl,
      domain: storeEntry.domain,
      done: false,
    };
  }

  async getCrawlResults(
    crawlId: string,
    take: number,
    skip: number
  ): Promise<CrawlResult[]> {
    const storedResults = this.getStoredResults(crawlId);

    return storedResults.urls.slice(skip, take + skip);
  }

  private notifyProgressHandlers(crawlProgress: CrawlProgress) {
    this.emitter.emit(MemoryCrawlService.EVENTS.PROGRESS, crawlProgress);
  }

  private static validateProgressUrl(storedResult: StoredResult, url: string) {
    if (!storedResult.pendingUrls.has(url)) {
      throw new Error(MemoryCrawlService.ERRORS.URL_NOT_PENDING);
    }
    if (storedResult.crawledUrls.has(url)) {
      throw new Error(MemoryCrawlService.ERRORS.URL_ALREADY_CRAWLED);
    }
  }

  private pushToQueue(storeEntry: StoredResult) {
    return this.queue.addTask({
      url: storeEntry.baseUrl,
      crawlId: storeEntry.id,
      domain: storeEntry.domain,
    });
  }

  private getStoredResults(crawlId: string): StoredResult {
    const storedResults = this.store.get(crawlId);

    if (!storedResults) {
      throw new Error(MemoryCrawlService.ERRORS.UNKNOWN_CRAWL);
    }

    return storedResults;
  }

  private checkCrawlDone(crawlResults: StoredResult, crawlId: string) {
    if (crawlResults.pendingUrls.size === 0) {
      crawlResults.done = true;

      const crawlProgress = {
        done: true,
        totalCrawled: crawlResults.urls.length,
        crawlId,
      };

      this.notifyProgressHandlers(crawlProgress);
    }
  }
}
