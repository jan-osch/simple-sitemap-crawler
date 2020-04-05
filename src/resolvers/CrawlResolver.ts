import {
  Arg,
  Field,
  ID,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { Inject } from "typedi";

import {
  Crawl,
  CRAWL_SERVICE_KEY,
  CrawlService,
} from "../interfaces/CrawlService";
import { normalizeLink } from "../utils/urlUtils";
import { IsUrl } from "class-validator";

@ObjectType()
class CrawlTO implements Crawl {
  @Field(() => ID)
  id: string;

  @Field()
  baseUrl: string;

  @Field()
  domain: string;

  @Field()
  done: boolean;
}

@InputType()
class StartCrawlInput {
  @Field()
  @IsUrl({ require_tld: false }) // allow localhost
  url: string;
}

@Resolver()
export class CrawlResolver {
  constructor(@Inject(CRAWL_SERVICE_KEY) private crawlService: CrawlService) {}

  @Mutation(() => CrawlTO)
  startCrawl(@Arg("input") input: StartCrawlInput): Promise<CrawlTO> {
    return this.crawlService.startCrawl(normalizeLink(new URL(input.url)));
  }

  @Query(() => CrawlTO)
  crawl(@Arg("id") id: string): Promise<CrawlTO> {
    return this.crawlService.findById(id);
  }
}
