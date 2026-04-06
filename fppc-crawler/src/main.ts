import { PlaywrightCrawler } from "crawlee";

export async function runScraper(queries: string[]) {

  const crawler = new PlaywrightCrawler({

    headless: false, 

    maxRequestsPerCrawl: queries.length,

    async requestHandler({ page, request, log }) {

      log.info(`Processing: ${request.loadedUrl}`);

      await page.waitForSelector("h3");

      const results = await page.$$eval("h3", (elements) =>
        elements.slice(0, 5).map(el => {
          const anchor = el.closest("a");
          return {
            title: el.textContent?.trim(),
            link: anchor ? anchor.href : null
          };
        })
      );

      console.log("\nTop Results:");
      results.forEach((r, i) => {
        console.log(`${i + 1}. ${r.title}`);
        console.log(`   ${r.link}`);
      });

    }

  });

  await crawler.run(queries);
}