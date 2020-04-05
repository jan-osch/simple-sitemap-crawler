import { Queue } from "../interfaces/Queue";
import { Fetcher } from "../interfaces/Fetcher";
import { CrawlerCache } from "../interfaces/CrawlerCache";
import { CrawlerTask } from "../interfaces/CrawlerTask";

export class CrawlerWorker {
  constructor(
    private queue: Queue<CrawlerTask>,
    private fetcher: Fetcher,
    private crawlResultsService: CrawlerCache
  ) {}

  start() {
    (async () => {
      while (true) {
        const task = await this.queue.getNextTask();
        await this.executeTask(task);
      }
    })();
  }

  private async executeTask(task: CrawlerTask): Promise<void> {
    const { crawlId } = task;

    await this.crawlResultsService.notifyUrlStarted(crawlId, task.url);

    const result = await this.fetcher.fetch(task.url, task.domain);

    if (result.success) {
      for (const child of result.children) {
        if (await this.crawlResultsService.visitIfPossible(crawlId, child)) {
          await this.queue.addTask({
            url: child,
            crawlId,
            domain: task.domain,
          });
        }
      }
    }

    await this.crawlResultsService.notifyUrlDone(
      crawlId,
      task.url,
      result.success
    );
  }
}
