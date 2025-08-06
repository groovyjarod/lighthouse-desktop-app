// import { spawn } from "child_process";

const urlBase = "https://www.familysearch.org/";
const language = "en";

// TODO: introduce plimit through the INPUT function in AuditAll.jsx

async function retryAudit(fn, retries = 2) {
  let errMessage;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      errMessage = err;
      console.warn(`Retry ${i + 1} failed. Trying agin...`);
    }
  }
  throw errMessage;
}

export default async function commenceAllAudits(paths, recommendedConcurrentAudits, p_limit, runIndividualAudit) {

  const numberOfSimultaneousAudits = p_limit(recommendedConcurrentAudits)

  const tasks = paths.map((path, index) => {
    const urlPath = `${urlBase}${language}/wiki/${path}`;
    const outputFile = `../audits/audit-results/${index + 1}-${path}.json`;
    return numberOfSimultaneousAudits(() =>
      // retryAudit(() => runAuditAsChild(urlPath, outputFile), 2)
      retryAudit(() => runIndividualAudit(urlPath, outputFile), 2)
    );
  });

  await Promise.all(tasks);
  console.log("All audits complete!");
}
