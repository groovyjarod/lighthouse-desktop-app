import puppeteer from "puppeteer";
import lighthouse from "lighthouse";
import { URL } from "url";

function relayLog(message) {
  const window = BrowserWindow.getAllWindows()[0];
  if (window && window.webContents)
    window.webContents.send("lighthouse-log", message);
}

export default async function generatePuppeteerAudit(
  url,
  testing_method,
  user_agent,
  viewportWidth
) {
  console.log(`Using PUPPETEER_EXECUTABLE_PATH: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
  const OUTPUT_FORMAT = "json";
  const TESTING_METHOD = testing_method;
  const isMobile = TESTING_METHOD === "mobile";
  const USER_AGENT = user_agent;
  const LOADING_TIME = 6000;
  const viewport = { width: parseInt(viewportWidth), height: 800 }

  try {
    const browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        `--user-agent=${USER_AGENT}`,
      ],
    });

    const page = await browser.newPage();

    const ip = await page.evaluate(async () => {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      return data.ip;
    });

    await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: "networkidle2", timeout: LOADING_TIME });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); // scroll to bottom for lazy loads
    await new Promise((r) => setTimeout(r, 1000));

    const wsEndpoint = browser.wsEndpoint();
    const endpointURL = new URL(wsEndpoint);

    const options = {
      port: endpointURL.port,
      output: OUTPUT_FORMAT,
      logLevel: "info",
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
        emulatedUserAgent: USER_AGENT,
      },
    };

    const originalConsole = console.log;
    console.log = (msg) => {
      relayLog(msg);
      originalConsole(msg);
    };

    const runResult = await lighthouse(url, options, config);

    const report = runResult.report;
    const accessibilityScore =
      runResult.lhr.categories.accessibility.score * 100;

    console.log = originalConsole;

    await browser.close();
    return [report, accessibilityScore];
  } catch (err) {
    console.error("In generatePuppeteerAudit: ", err.message);
    return [null, 0];
  }
}
