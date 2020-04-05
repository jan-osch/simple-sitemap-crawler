import { ApolloServer, PubSub } from "apollo-server";
import { buildSchema } from "type-graphql";
import { Container } from "typedi";

import { CrawlResolver } from "../resolvers/CrawlResolver";
import { CrawlResultResolver } from "../resolvers/CrawlResultsResolver";
import {
  CRAWL_SERVICE_KEY,
  CrawlProgress,
  CrawlService,
} from "../interfaces/CrawlService";
import { getCrawlTopic } from "../utils/topics";
import { CrawlProgressResolver } from "../resolvers/CrawlProgressResolver";

const PORT = 3000;

const connectPubSub = (pubSub: PubSub) => {
  const crawlService: CrawlService = Container.get(CRAWL_SERVICE_KEY);

  const callback = (crawlProgress: CrawlProgress) =>
    pubSub.publish(getCrawlTopic(crawlProgress.crawlId), crawlProgress);

  crawlService.onCrawlProgress(callback);
};

let server: ApolloServer;

export const startServer = async () => {
  const pubSub = new PubSub();

  connectPubSub(pubSub);

  const schema = await buildSchema({
    resolvers: [CrawlResolver, CrawlResultResolver, CrawlProgressResolver],
    container: Container,
    pubSub: pubSub,
  });

  server = new ApolloServer({
    schema,
    playground: true,
  });

  const { url } = await server.listen(PORT);

  console.log(`GraphQL server started at ${url}`);
};

export const stopServer = async () => {
  if (server) {
    await server.stop();
  }
};
