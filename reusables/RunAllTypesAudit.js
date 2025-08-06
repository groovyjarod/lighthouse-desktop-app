const runAllTypesAudit = async (
  fullUrl,
  userAgent,
  pLimit,
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

  const runAllSizes = pLimit(4);
  const tasks = SIZES.map((size) =>
    runAllSizes(async () => {
      if (isCancelled) {
        throw new Error("Audit cancelled by user");
      }
      const processId = `audit-${Date.now()}-${size}`
      return retryAudit(async () => {
        try {
          const result = await window.electronAPI.getSpawn(
            fullUrl,
            `./audits/all-audit-sizes/${size}-${getLastPathSegment(
              fullUrl
            )}.json`,
            size > 500 ? "desktop" : "mobile",
            userAgent,
            size,
            processId
          );
          if (result !== "Audit complete.") {
            throw new Error(`Audit failed for size ${size}`);
          }
          if (isCancelled) {
            throw new Error("Audit cancelled by user");
          }
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
        const filePath = `./audits/all-audit-sizes/${size}-${getLastPathSegment(
          fullUrl
        )}.json`;
        const sizedAudit = await window.electronAPI.getFile(filePath);
        return { size, data: JSON.parse(sizedAudit) };
    } catch (err) {
        console.error(`Upon trying to read folders: ${err}`)
    }
  });

  const auditResults = await Promise.all(auditPromises);
  auditResults.forEach(({ size, data }) => {
    allAudits[`stats${size}pxWidth`] = data;
  });

  const deleteWorked = await window.electronAPI.clearAllSizedAuditsFolder();
  console.log("clearAllSizedAuditsFolder result:", deleteWorked);

  const filePath = `./audits/${folderPath}/allTypes-${getLastPathSegment(
    fullUrl
  )}.json`;
  const finalResult = await window.electronAPI.saveFile(filePath, allAudits);
  if (!finalResult.success) {
    throw new Error(finalResult.error);
  }

  return allAudits;
};

export default runAllTypesAudit;
