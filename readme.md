# Simple Sitemap Crawler

## Overview
Simple crawler built with Typescript, GraphQL, Puppeteer and TypeGraphQL.
User can provide a valid URL and it will crawl all links within the same domain in a BFS manner. 

## Setup
`npm install` install project dependencies

## Start
`npm run start` the server should start at [http://localhost:3000/graphql](http://localhost:3000/graphql)

`npm run start:watch` starts server in watch mode for development

## Test
`npm run test` runs unit-tests

`npm run test:e2e` runs end-to-end tests

## Features
* Uses `Puppeteer` as fetcher to evaluate JavaScript rendered pages.
* Supports multiple concurrent workers (change `WORKER_CONCURRENCY` in `src/start.ts` to add workers).
* Supports multiple concurrent crawls.
* Crawl progress can be monitored using graphql subscription.
* Currently implemented using in-memory storage, but can be extended to add persistence and horizontal scalability. 
* Implementation is decoupled: 
    * Other fetcher types can be added (implement [src/interfaces/Fetcher.ts](src/interfaces/Fetcher.ts))
    * Distributed queue can be added (implement [src/interfaces/Queue.ts](src/interfaces/Queue.ts))
    * Persistent storage can be added (implement [src/interfaces/CrawlerCache.ts](src/interfaces/CrawlerCache.ts) and [src/interfaces/CrawlService.ts](src/interfaces/CrawlService.ts))
* Thanks to dependency injection and dependency inversion components are easily replaced. 
    
