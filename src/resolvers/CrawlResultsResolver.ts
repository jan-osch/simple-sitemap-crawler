import { Min, Max } from "class-validator";
import {
  Args,
  ArgsType,
  Field,
  Int,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";

import {
  CRAWL_SERVICE_KEY,
  CrawlResult,
  CrawlService,
} from "../interfaces/CrawlService";
import { Inject } from "typedi";

@ObjectType()
class CrawlResultTO implements CrawlResult {
  @Field()
  success: boolean;

  @Field()
  url: string;
}

@ArgsType()
export class GetCrawlResultsArgs {
  @Field(() => String)
  crawlId: string;

  @Field(() => Int, { nullable: true, defaultValue: 25 })
  @Min(1)
  @Max(100)
  take: number;

  @Field(() => Int, { defaultValue: 0, nullable: true })
  @Min(0)
  skip: number;
}

@Resolver(CrawlResultTO)
export class CrawlResultResolver {
  constructor(@Inject(CRAWL_SERVICE_KEY) private crawlService: CrawlService) {}

  @Query(() => [CrawlResultTO])
  getCrawlResults(@Args() args: GetCrawlResultsArgs): Promise<CrawlResultTO[]> {
    return this.crawlService.getCrawlResults(
      args.crawlId,
      args.take,
      args.skip
    );
  }
}
