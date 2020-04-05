import * as puppeteer from "puppeteer";
import { Browser } from "puppeteer";

import { Fetcher, FetcherResult } from "../interfaces/Fetcher";
import { filterAndNormalizeHrefs } from "../utils/urlUtils";

export class PuppeteerFetcher implements Fetcher {
  private browser: Browser;

  private async initialize() {
    if (!this.browser) {
      this.browser = await puppeteer.launch();
    }
  }

  public async stop() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async fetch(url: string, baseDomain: string): Promise<FetcherResult> {
    try {
      return await this.fetchPage(url, baseDomain);
    } catch (err) {
      return {
        success: false,
        url,
        children: [],
        error: err.toString(),
      };
    }
  }

  async fetchPage(baseUrl: string, domain: string): Promise<FetcherResult> {
    await this.initialize();
    const page = await this.browser.newPage();

    const result = await page.goto(baseUrl);
    if (!result || !result.ok()) {
      return {
        success: false,
        url: baseUrl,
        children: [],
        error: result ? result.statusText() : "Unknown Error",
      };
    }

    const hrefs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("a"))
        .map((item) => item.getAttribute("href"))
        .filter((href) => Boolean(href)) as string[];
    });
    await page.close();

    const children = filterAndNormalizeHrefs(hrefs, domain, baseUrl);

    return {
      success: true,
      url: baseUrl,
      children,
    };
  }
}
