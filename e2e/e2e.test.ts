import "cross-fetch/polyfill";

import { createServer } from "http-server";
import { join } from "path";

import start, { shutdown } from "../src/start";
import ApolloClient, { gql } from "apollo-boost";

const DUMMY_WEBSITE_PORT = 3001;
const ASSETS_PATH = join(__dirname, "assets");
const DUMMY_WEBSITE_URI = `http://localhost:${DUMMY_WEBSITE_PORT}`;

const client = new ApolloClient({
  uri: "http://localhost:3000/",
});

const startDummyServer = () => {
  const dummyServer = createServer({
    root: ASSETS_PATH,
  });
  dummyServer.listen(DUMMY_WEBSITE_PORT);
};

const startCrawlMutation = gql`
  mutation($url: String!) {
    startCrawl(input: { url: $url }) {
      id
      domain
      baseUrl
    }
  }
`;

const getCrawlQuery = gql`
  query($id: String!) {
    crawl(id: $id) {
      done
      id
      domain
      baseUrl
    }
  }
`;

const getCrawlResultsQuery = gql`
  query($crawlId: String!, $take: Int, $skip: Int) {
    getCrawlResults(crawlId: $crawlId, take: $take, skip: $skip) {
      url
      success
    }
  }
`;

const promiseTimeout = (timeout: number) =>
  new Promise((resolve) => setTimeout(resolve, timeout));

describe("Sitemap Crawler test", () => {
  beforeAll(async () => {
    await start;
    startDummyServer();
  });

  afterAll(async () => {
    await shutdown();
  });

  test("should crawl a website and handle broken links", async () => {
    jest.setTimeout(20000);

    const expectedResult = [
      {
        url: "http://localhost:3001/",
        success: true,
      },
      {
        url: "http://localhost:3001/about",
        success: true,
      },
      {
        url: "http://localhost:3001/api",
        success: true,
      },
      {
        url: "http://localhost:3001/broken",
        success: false,
      },
      {
        url: "http://localhost:3001/about/en",
        success: true,
      },
      {
        url: "http://localhost:3001/hidden",
        success: true,
      },
    ];

    const result = await client.mutate({
      mutation: startCrawlMutation,
      variables: { url: DUMMY_WEBSITE_URI },
    });

    const crawlId = result.data.startCrawl.id;

    const getDoneStatus = async () => {
      const crawlResponse = await client.query({
        query: getCrawlQuery,
        fetchPolicy: "no-cache", // prevent infinite polling
        variables: { id: crawlId },
      });
      return crawlResponse.data.crawl.done;
    };

    while (!(await getDoneStatus())) {
      await promiseTimeout(1000);
    }

    const crawlResultsResponse = await client.query({
      query: getCrawlResultsQuery,
      variables: { crawlId: crawlId },
    });

    const actualResult = crawlResultsResponse.data.getCrawlResults;

    expect(actualResult).toEqual(
      expectedResult.map((object) => expect.objectContaining(object))
    );
  });
});
