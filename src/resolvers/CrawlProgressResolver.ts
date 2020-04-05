import {
  Arg,
  Field,
  ObjectType,
  Resolver,
  Root,
  Subscription,
} from "type-graphql";

import { CrawlProgress } from "../interfaces/CrawlService";
import { getCrawlTopic } from "../utils/topics";

@ObjectType()
class CrawlProgressTO implements CrawlProgress {
  @Field()
  crawlId: string;

  @Field()
  currentUrl: string;

  @Field()
  done: boolean;

  @Field()
  totalCrawled: number;
}

@Resolver()
export class CrawlProgressResolver {
  @Subscription({ topics: ({ args }) => getCrawlTopic(args.crawlId) })
  crawlProgress(
    // @ts-ignore
    @Arg("crawlId") crawlId: string,
    @Root() root: CrawlProgressTO
  ): CrawlProgressTO {
    return root;
  }
}
