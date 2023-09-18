import { OAIBaseComponent, WorkerContext, OmniComponentMacroTypes } from 'mercs_rete';
import Crawler from 'crawler';

const NS_OMNI = 'web-crawler';

let component = OAIBaseComponent.create(NS_OMNI, 'web-crawler')
  .fromScratch()
  .set('description', 'Crawls the web content for a list of URLs.')
  .set('title', 'Web Crawler')
  .set('category', 'Data Extraction')
  .setMethod('X-CUSTOM')
  .setMeta({
    source: {
        summary: 'Crawls the web content for a list of URLs.',
        authors: ['Mercenaries.ai Team'],
        links: {
            "Crawler Github": "https://github.com/bda-research/node-crawler",
        }
    }
})
component
  .addInput(
    component.createInput('urls', 'string')
      .set('description', 'List of URLs to crawl.')
      .setRequired(true)
      .toOmniIO()
  )
  .addOutput(
    component.createOutput('webContent', 'string')
      .set('description', 'The crawled web content')
      .toOmniIO()
  )
  .setMacro(OmniComponentMacroTypes.EXEC, async (payload: any, ctx: WorkerContext) => {
    const urls = payload.urls.split('\n');
    console.log('urls', urls);
    let webContent = '';
    const crawler = new Crawler({
      maxConnections: 10,
    });

    try {
        await Promise.all(urls.map((url: string) => {
            return new Promise((resolve, reject) => {
                crawler.queue([{
                    uri: url,
                    callback: (error: Error | null, res: any, done: Function) => {
                        if (error) {
                            console.error(error);
                            reject(error);
                        } else {
                            const $ = res.$;
                            if ($) {
                                console.log($('title').text());
                                webContent += $('body').text();
                            }
                            resolve(null);
                        }
                        done();
                    }
                }]);
            });
        }));
    } catch (error) {
        console.error('Error while crawling:', error);
        // Handle error appropriately here
    }
    
    return { webContent };
  });
const WebCrawlerComponent = component.toJSON();

export default {
    createComponents: () => ({
      blocks: [WebCrawlerComponent],
      patches: []
    })
}