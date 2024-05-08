const puppeteer = require("puppeteer");

describe('Worker Requests', () => {

    it('should return a 200 status code', async () => {
        const browser = await puppeteer.launch({
            headless: false,
            devtools: true
        });
        const page = await browser.newPage();
        const client = await page.createCDPSession()

        // Commenting these lines out will stop the request from hanging
        await page.setRequestInterception(true)
        await page.on('request', request => request.continue())
        ////

        await Promise.all([
            new Promise(resolve => interceptAllTrafficForPageUsingFetch(
                    client,
                    async (args) => {
                        await client.send('Fetch.continueRequest', {
                            requestId: args.requestId,
                        })

                        if (
                            args.request.url === ('http://localhost:3000/test.txt') &&
                            args.responseStatusCode === 200
                        ) {
                            resolve()
                        }
                    }
                )
            ),

            page.goto('http://localhost:3000')
        ])
    })
})

/**
 * Captures all traffic including from Web Workers, does something with it, and continues the request
 */
const interceptAllTrafficForPageUsingFetch = async (
    client,
    handleRequest
) => {
    //see: https://chromedevtools.github.io/devtools-protocol/tot/Fetch#method-enable
    await client.send('Fetch.enable', {
        //see: https://chromedevtools.github.io/devtools-protocol/tot/Fetch#type-RequestPattern
        patterns: [
            {
                urlPattern: '*',
                requestStage: 'Response',
            },
        ],
    })
    //see: https://chromedevtools.github.io/devtools-protocol/tot/Fetch#event-requestPaused
    await client.on('Fetch.requestPaused', handleRequest)
}