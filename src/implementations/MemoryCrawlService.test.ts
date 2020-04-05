import { MemoryCrawlService } from "./MemoryCrawlService";

const mockQueue = {
  addTask: jest.fn().mockResolvedValue(true),

  getNextTask: jest.fn().mockResolvedValue(true),
};

const testUrl = "https://test.com/";
const testDomain = "test.com";

describe("MemoryQueue", () => {
  test("startCrawl should return new crawl with unique id and add task to queue", async () => {
    const service = new MemoryCrawlService(mockQueue);

    const result = await service.startCrawl(testUrl);

    const expected = {
      id: expect.any(String),
      baseUrl: testUrl,
      domain: testDomain,
      done: false,
    };

    const expectedTask = {
      url: testUrl,
      domain: testDomain,
      crawlId: expect.any(String),
    };

    expect(result).toEqual(expected);
    expect(mockQueue.addTask).toBeCalled();
    expect(mockQueue.addTask).toHaveBeenCalledWith(expectedTask);
  });

  test("visitIfPossible should resolve true only if not called with given crawlId & url before", async () => {
    const service = new MemoryCrawlService(mockQueue);

    const { id: crawlId } = await service.startCrawl(testUrl);

    expect(await service.visitIfPossible(crawlId, testUrl + "about")).toEqual(
      true
    );
    expect(await service.visitIfPossible(crawlId, testUrl + "about")).toEqual(
      false
    );
    expect(await service.visitIfPossible(crawlId, testUrl + "docs")).toEqual(
      true
    );
  });

  describe("notifyUrlStarted", () => {
    test("when called on unknown url, should throw", async () => {
      const service = new MemoryCrawlService(mockQueue);

      const { id: crawlId } = await service.startCrawl(testUrl);

      try {
        await service.notifyUrlStarted(crawlId, testUrl + "about");
      } catch (err) {
        expect(err.message).toBe(MemoryCrawlService.ERRORS.URL_NOT_PENDING);
      }
    });

    test("when called on known url, should trigger onCrawlProgress callback", async () => {
      const service = new MemoryCrawlService(mockQueue);
      const expectedUrl = testUrl + "about";
      const callback = jest.fn();

      service.onCrawlProgress(callback);

      const { id: crawlId } = await service.startCrawl(testUrl);

      await service.visitIfPossible(crawlId, expectedUrl);
      await service.notifyUrlStarted(crawlId, expectedUrl);

      const expected = {
        crawlId,
        done: false,
        currentUrl: expectedUrl,
        totalCrawled: 0,
      };

      expect(callback).toHaveBeenCalledWith(expected);
    });
  });

  describe("notifyUrlDone", () => {
    test("when called on unknown url, should throw", async () => {
      const service = new MemoryCrawlService(mockQueue);

      const { id: crawlId } = await service.startCrawl(testUrl);

      try {
        await service.notifyUrlDone(crawlId, testUrl + "about", true);
      } catch (err) {
        expect(err.message).toBe(MemoryCrawlService.ERRORS.URL_NOT_PENDING);
      }
    });

    describe("when called on a known crawl url", () => {
      test("and with no other pending urls, should pass done progress to onCrawlProgress callback", async () => {
        const service = new MemoryCrawlService(mockQueue);
        const callback = jest.fn();

        service.onCrawlProgress(callback);

        const { id: crawlId } = await service.startCrawl(testUrl);
        await service.notifyUrlDone(crawlId, testUrl, true);

        const expected = {
          crawlId,
          done: true,
          totalCrawled: 1,
        };

        expect(callback).toHaveBeenCalledWith(expected);
      });

      test("ut other urls have been visited should not trigger onCrawlProgress callback", async () => {
        const service = new MemoryCrawlService(mockQueue);
        const callback = jest.fn();

        service.onCrawlProgress(callback);

        const { id: crawlId } = await service.startCrawl(testUrl);
        await service.visitIfPossible(crawlId, testUrl + "about");
        await service.notifyUrlDone(crawlId, testUrl, true);

        expect(callback).not.toHaveBeenCalled();
      });
    });
  });

  describe("getCrawlResults", () => {
    test("when called on unknown url, should throw", async () => {
      const service = new MemoryCrawlService(mockQueue);

      const { id: crawlId } = await service.startCrawl(testUrl);
      const aboutUrl = testUrl + "about";

      await service.notifyUrlStarted(crawlId, testUrl);
      await service.visitIfPossible(crawlId, aboutUrl);
      await service.notifyUrlDone(crawlId, testUrl, true);
      await service.notifyUrlStarted(crawlId, aboutUrl);
      await service.notifyUrlDone(crawlId, aboutUrl, true);

      const actual = await service.getCrawlResults(crawlId, 10, 0);

      const expected = [
        {
          url: testUrl,
          success: true,
        },
        {
          url: aboutUrl,
          success: true,
        },
      ];

      expect(actual).toEqual(expected);
    });
  });
});
