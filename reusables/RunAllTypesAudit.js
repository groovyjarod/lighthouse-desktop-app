import pLimit from 'p-limit';
import path from 'path';

const runAllTypesAudit = async (
  fullUrl,
  userAgent,
  pLimitLib = pLimit,
  getLastPathSegment,
  folderPath,
  isCancelled,
  setRunningStatus,
  retryAudit
) => {
  const SIZES = [1920, 1280, 900, 500];

  if (isCancelled) {
    throw new Error("Audit cancelled by user");
  }

  const runAllSizes = pLimitLib(4);
  const tasks = SIZES.map((size) =>
    runAllSizes(async () => {
      if (isCancelled) {
        throw new Error("Audit cancelled by user");
      }
      const processId = `audit-${Date.now()}-${size}`;
      return retryAudit(async () => {
        try {
          const result = await window.electronAPI.getSpawn(
            fullUrl,
            `./audits/all-audit-sizes/${size}-${getLastPathSegment(fullUrl)}.json`,
            size > 500 ? "desktop" : "mobile",
            userAgent,
            size,
            processId
          );
          console.log(`get-spawn result for size ${size}:`, result);
          if (typeof result === "string" && result.includes("Audit complete.")) {
            return "Audit complete.";
          } else if (typeof result === "string" && result.includes("Audit incomplete.")) {
            throw new Error(`Audit failed for size ${size}: ${result}`);
          } else if (typeof result === "object" && result.accessibilityScore > 0) {
            return "Audit complete.";
          }
          throw new Error(`Audit failed for size ${size}: ${JSON.stringify(result)}`);
        } catch (err) {
          throw err;
        }
      });
    })
  );

  await Promise.all(tasks);

  const allAudits = {};
  const auditPromises = SIZES.map(async (size) => {
    if (isCancelled) {
      throw new Error("Audit cancelled by user");
    }
    try {
      const filePath = `./audits/all-audit-sizes/${size}-${getLastPathSegment(fullUrl)}.json`;
      const sizedAudit = await window.electronAPI.getFile(filePath);
      return { size, data: JSON.parse(sizedAudit) };
    } catch (err) {
      console.error(`Error reading audit file for size ${size}: ${err.message}`);
      throw err;
    }
  });

  const auditResults = await Promise.all(auditPromises);
  auditResults.forEach(({ size, data }) => {
    allAudits[`stats${size}pxWidth`] = data;
  });

  try {
    const deleteWorked = await window.electronAPI.clearAllSizedAuditsFolder();
    console.log("clearAllSizedAuditsFolder result:", deleteWorked);
  } catch (err) {
    console.error(`Error clearing all-audit-sizes folder: ${err.message}`);
  }

  const filePath = `./audits/${folderPath}/allTypes-${getLastPathSegment(fullUrl)}.json`;
  const finalResult = await window.electronAPI.saveFile(filePath, allAudits);
  if (!finalResult) {
    throw new Error(`Failed to save allTypes file: ${filePath}`);
  }

  return allAudits;
};

export default runAllTypesAudit;