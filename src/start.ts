import "reflect-metadata";
import { Container } from "typedi";

import { CRAWL_SERVICE_KEY } from "./interfaces/CrawlService";
import { MemoryCrawlService } from "./implementations/MemoryCrawlService";
import { CrawlerWorker } from "./CrawlerWorker/CrawlerWorker";
import MemoryQueue from "./implementations/MemoryQueue";
import { CrawlerTask } from "./interfaces/CrawlerTask";
import { PuppeteerFetcher } from "./implementations/PuppeerFetcher";
import { startServer, stopServer } from "./server/starServer";

const WORKER_CONCURRENCY = 1; // os.cpus().length

const queue = new MemoryQueue<CrawlerTask>();
const memoryCrawlService = new MemoryCrawlService(queue);

Container.set({
  id: CRAWL_SERVICE_KEY,
  value: memoryCrawlService,
});

const fetchers: PuppeteerFetcher[] = [];

const spawnWorker = () => {
  const fetcher = new PuppeteerFetcher();
  fetchers.push(fetcher);
  const worker = new CrawlerWorker(queue, fetcher, memoryCrawlService);
  worker.start();
};

const startWorkers = () => {
  let workers = 0;
  while (workers < WORKER_CONCURRENCY) {
    spawnWorker();
    workers++;
  }
};

startWorkers();

export const shutdown = async () => {
  await Promise.all(fetchers.map((fetcher) => fetcher.stop()));
  await stopServer();
};

export default startServer();
