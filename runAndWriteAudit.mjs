import fs from 'fs/promises';
import path from 'path';
import createReport from './Audit_Logic/createFinalizedReport.mjs';

const [,, url, outputFile, testing_method, user_agent, viewport] = process.argv;

if (!url || !outputFile) {
  console.error("usage: node runAndWriteAudit.mjs <url> <outputFile>");
  console.log('Audit incomplete.');
  process.exit(1);
}

async function getReportData(url, testing_method, user_agent, viewport) {
  try {
    console.error(`Running createReport for ${url}, method: ${testing_method}, viewport: ${viewport}`);
    const returnData = await createReport(url, testing_method, user_agent, viewport);
    console.error(`createReport result: ${JSON.stringify(returnData)}`);
    return returnData;
  } catch (err) {
    console.error(`In runAndWriteAudit / getReportData: ${err.message}`);
    return { accessibilityScore: 0, error: err.message };
  }
}

async function main() {
  try {
    const jsonData = await getReportData(url, testing_method, user_agent, viewport);
    const parsedData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    if (parsedData.accessibilityScore > 0) {
      const outputDir = path.dirname(outputFile);
      await fs.mkdir(outputDir, { recursive: true });
      await fs.writeFile(outputFile, JSON.stringify(parsedData, null, 2), 'utf8');
      console.log('Audit complete.');
    } else {
      console.error(`Audit incomplete: accessibilityScore=${parsedData.accessibilityScore}, error=${parsedData.error || 'none'}`);
      console.log('Audit incomplete.');
    }
  } catch (err) {
    console.error(`In runAndWriteAudit: Audit failed for ${url}: ${err.message}`);
    console.log('Audit incomplete.');
  }
}

main();