import puppeteer, { executablePath } from "puppeteer";
import lighthouse from "lighthouse";
import { URL } from "url";

export default async function generatePuppeteerAudit(
  puppeteerUrl,
  testing_method,
  user_agent,
  viewportWidth,
  isUsingUserAgent,
  isViewingAudit
) {
  console.log(`Using PUPPETEER_EXECUTABLE_PATH: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
  const OUTPUT_FORMAT = "json";
  const TESTING_METHOD = testing_method;
  const isMobile = TESTING_METHOD === "mobile";
  const USER_AGENT = isUsingUserAgent === "yes" ? user_agent : "The user has indicated they do not want to use a User Agent Key for this run.";
  const LOADING_TIME = 7000;
  const LIGHTHOUSE_TIMEOUT = 20000;
  const viewport = { width: parseInt(viewportWidth), height: 800 }
  const EXPLICIT_PORT = 9222

  process.on('exit', (code) => {
    console.log(`Process exiting with code ${code}`)
  })
  process.on('unhandledRejection', (reason, promise) => {
    console.error('unhandled Rejection:', reason.mesage || reason)
    console.error('Promise:', promise)
  })

  let puppeteerArgs = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    `--remote-debugging-port=${EXPLICIT_PORT}`,
    '--remote-allow-origins=*',
    `--user-agent=${USER_AGENT}`
  ]

  let browser
  const puppeteerHeadlessConfig = {
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    headless: true,
    args: puppeteerArgs,
  }
  const puppeteerConfig = {
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    headless: false,
    args: puppeteerArgs,
  }

  try {
      const useConfig = isViewingAudit == "no" ? puppeteerHeadlessConfig : puppeteerConfig;
      browser = await puppeteer.launch(useConfig);

    const page = await browser.newPage();
    page.on('console', (msg) => console.log(`Chrome Console [${msg.type()}]: ${msg.text()}`));
    page.on('pageerror', (err) => console.error('Chrome Page Error:', err.message));
    page.on('requestfailed', (req) => console.error('Chrome Request Failed:', req.url(), req.failure().errorText));

    const ip = await page.evaluate(async () => {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip;
    });

    await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
    await page.goto(puppeteerUrl, { waitUntil: "networkidle2", timeout: LOADING_TIME });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); // scroll to bottom for lazy loads
    await new Promise((r) => setTimeout(r, 1000));

    const wsEndpoint = browser.wsEndpoint();
    const endpointURL = new URL(wsEndpoint);
    console.log('Parsed Endpoint Port:', endpointURL.port)
    console.log('Verifying WebSocket connection...')
    const wsTest = await page.evaluate((endpoint) => {
      return new Promise((resolve) => {
        const ws = new WebSocket(endpoint)
        ws.onopen = () => resolve('WebSocket connected')
        ws.onerror = () => resolve('WebSocket failed')
        setTimeout(() => resolve('WebSocket timeout'), 5000)
      })
    }, wsEndpoint)
    console.log('WebSocket Test Result:', wsTest)

    const options = {
      port: parseInt(endpointURL.port),
      output: OUTPUT_FORMAT,
      logLevel: "verbose",
      maxWaitForLoad: LOADING_TIME,
      disableStorageReset: true,
      onlyCategories: ["accessibility"]
    };

    const config = {
      extends: "lighthouse:default",
      settings: {
        formFactor: TESTING_METHOD,
        screenEmulation: {
          mobile: isMobile,
          width: viewport.width,
          height: viewport.height,
          deviceScaleFactor: 1,
          disabled: false,
        },
        onlyCategories: ["accessibility"],
        pauseAfterFcpMs: 3000,
        maxWaitForLoad: LOADING_TIME,
        emulatedUserAgent: isUsingUserAgent === "yes" ? USER_AGENT : '',
      },
    };

    try {
      console.log('Starting Lighthouse audit...')
      // const runResult = await Promise.race([
      //   lighthouse(puppeteerUrl, options, config),
      //   new Promise((_, reject) => setTimeout(() => reject(new Error ('Lighthouse timed out')), LIGHTHOUSE_TIMEOUT)),
      // ])
      const runResult = await lighthouse(puppeteerUrl, options, config);
      console.log('Lighthouse audit complete')
      if (!runResult || !runResult.lhr) {
        console.error('Lighthouse returned invalid result:', JSON.stringify(runResult, null, 2))
        throw new Error(`Invalid Lighthouse result`)
      }
      const report = runResult.report;
      const accessibilityScore = runResult.lhr.categories.accessibility.score * 100;
      console.log(`Accessibility Score: ${accessibilityScore}`)
      await browser.close();
      return [report, accessibilityScore];
    } catch (lighthouseError) {
      console.error('Lighthouse Error:', lighthouseError.message)
      console.error('Lighthouse Stack:', lighthouseError.stack)
      throw lighthouseError
    }

  } catch (err) {
    console.error("In generatePuppeteerAudit: ", err.message);
    console.error("Stack Trace:", err.stack)
    if (browser) await browser.close()
    return [err, 0];
  }
}
