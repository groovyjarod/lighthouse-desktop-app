import React, { useRef, useState, useEffect, memo } from "react";
import { VStack, HStack, Input } from "@chakra-ui/react";
import CenteredHstackCss from "../reusables/CenteredHstackCss";
import CenteredVstackCss from "../reusables/CenteredVstackCss";
import MenuHeader from "../reusables/MenuHeader";
import LinkButton from "../reusables/LinkButton";
import BodyVstackCss from "../reusables/BodyVstackCss";
import BodyHstackCss from "../reusables/BodyHstackCss";
import pLimit from "p-limit";
import getLastPathSegment from "../reusables/getLastPathSegment";
import runAllTypesAudit from "../reusables/RunAllTypesAudit";

const UrlInput = memo(({ fullUrl, setFullUrl }) => (
  <Input
    className="input"
    type="text"
    name="audit-link"
    value={fullUrl}
    onChange={(e) => setFullUrl(e.target.value.trim())}
    required
  />
));

const ReadyScreen = memo(
  ({
    fullUrl,
    setFullUrl,
    testingMethod,
    setTestingMethod,
    handleAudit,
    handleAllSizesAudit,
  }) => {
    return (
      <VStack {...BodyVstackCss}>
        <h2>Paste Webpage Link Here</h2>
        <UrlInput fullUrl={fullUrl} setFullUrl={setFullUrl} />
        <h2>Choose Testing Method</h2>
        <HStack {...CenteredHstackCss}>
          <HStack {...BodyHstackCss}>
            <input
              type="radio"
              name="testingMethod"
              value="desktop"
              checked={testingMethod === "desktop"}
              onChange={(e) => setTestingMethod(e.target.value)}
            />
            <label htmlFor="desktop">Desktop</label>
          </HStack>
          <HStack {...BodyHstackCss}>
            <input
              type="radio"
              name="testingMethod"
              value="mobile"
              checked={testingMethod === "mobile"}
              onChange={(e) => setTestingMethod(e.target.value)}
            />
            <label htmlFor="mobile">Mobile</label>
          </HStack>
          <HStack {...BodyHstackCss}>
            <input
              type="radio"
              name="testingMethod"
              value="all"
              checked={testingMethod === "all"}
              onChange={(e) => setTestingMethod(e.target.value)}
            />
            <label htmlFor="all">All sizes</label>
          </HStack>
        </HStack>
        <button
          className="btn btn-main"
          onClick={testingMethod === "all" ? handleAllSizesAudit : handleAudit}
          disabled={fullUrl.length < 8 || !testingMethod}
        >
          Start Audit
        </button>
      </VStack>
    );
  }
);

const AuditOne = () => {
  const [runningStatus, setRunningStatus] = useState("ready");
  const [fullUrl, setFullUrl] = useState("");
  const [pathName, setPathName] = useState("");
  const [testingMethod, setTestingMethod] = useState("desktop");
  const [userAgent, setUserAgent] = useState("");
  const [titleHeader, setTitleHeader] = useState("Audit One Webpage");
  const [isCancelled, setIsCancelled] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const isCancelledRef = useRef(isCancelled)

  useEffect(() => {
    window.electronAPI
      .getFile("./settings/secretUserAgent.txt")
      .then(setUserAgent)
      .catch(console.error);
  }, []);

  useEffect(() => {
    isCancelledRef.current = isCancelled
  }, [isCancelled])

  const retryAudit = async (fn, retries = 2) => {
    for (let i = 0; i < retries; i++) {
      if (isCancelledRef.current) {
        console.log('initial check for isCancelled worked.');
        throw new Error("Audit cancelled by user");
      }
      try {
        const result = await fn();
        if (isCancelledRef.current) {
          console.log('Post-fn isCancelledRef check worked.');
          throw new Error("Audit cancelled by user");
        }
        return result;
      } catch (err) {
        if (isCancelledRef.current) {
          console.log('Error isCancelledRef check worked.');
          throw new Error("Audit cancelled by user");
        }
        console.warn(`Retry ${i + 1} failed. Trying again...`, err);
        if (i < retries - 1) {
          if (!isCancelledRef.current) setRunningStatus("warning");
          else {
            console.log('Retry skipped due to cancellation.');
            throw new Error('Audit cancelled by user');
          }
        } else {
          console.log('All retries exhausted.');
          throw err;
        }
      }
    }
  };

  const handleCancelAudit = async () => {
    setIsCancelled(true);
    try {
      await window.electronAPI.cancelAudit()
      setRunningStatus("cancelled")
      setTitleHeader("Audit Cancelled")
      setErrorMessage("Audit was cancelleed by the user.")
    } catch (err) {
      console.error("Cancel audit failed:", err)
    }
  };

  const handleAllSizesAudit = async () => {
    setRunningStatus("running");
    setTitleHeader("Auditing All Sizes...");
    setPathName(getLastPathSegment(fullUrl));
    setAuditLogs([]);
    setIsCancelled(false);
    try {
      const result = await retryAudit(async () => {
        const result = await runAllTypesAudit(
          fullUrl,
          userAgent,
          pLimit,
          getLastPathSegment,
          'custom-audit-results',
          isCancelledRef.current,
          setRunningStatus,
          retryAudit
        );
        console.log(`runAllTypesAudit result:`, result);
        if (typeof result === "string" && result.includes("Audit complete.")) {
          return "Audit complete.";
        } else if (typeof result === "string" && result.includes("Audit incomplete.")) {
          throw new Error(`AuditOne handleAllSizesAudit: Audit failed for all: ${result}`);
        } else if (typeof result === "object" && Object.values(result).every(r => r.accessibilityScore > 0)) {
          return "Audit complete.";
        }
        throw new Error(`AuditOne handleAllSizesAudit: Audit failed for all: ${JSON.stringify(result)}`);
      });
      console.log(`All sizes audit completed: ${result}`);
      setRunningStatus("finished");
      setTitleHeader("Finished Auditing All Sizes");
    } catch (err) {
      console.error("handleAllSizesAudit in AuditOne.jsx failed:", err);
      if (err.message === "Audit cancelled by user") {
        setRunningStatus("cancelled");
        setTitleHeader("Audit Cancelled");
        setErrorMessage("Audit was cancelled by the user.");
      } else {
        setRunningStatus("error");
        setTitleHeader("Audit Error");
        setErrorMessage(err.message || "Failed to complete all sizes audit.");
      }
    }
  };

  const handleAudit = async () => {
    setRunningStatus("running");
    setPathName(getLastPathSegment(fullUrl));
    setTitleHeader("Auditing...");
    setAuditLogs([]);
    try {
      const outputPath = `audits/custom-audit-results/${testingMethod}-${getLastPathSegment(fullUrl)}.json`;
      const processId = `${testingMethod}-${Date.now()}`;
      console.log(`Starting audit for ${fullUrl}, method: ${testingMethod}, output: ${outputPath}`);
      const result = await retryAudit(async () => {
        const result = await window.electronAPI.getSpawn(
          fullUrl,
          outputPath,
          testingMethod,
          userAgent,
          testingMethod === "desktop" ? 1920 : 500,
          processId
        );
        console.log(`get-spawn result:`, result);
        if (typeof result === "string" && result.includes("Audit complete.")) {
          return "Audit complete.";
        } else if (typeof result === "string" && result.includes("Audit incomplete.")) {
          throw new Error(`AuditOne handleAudit: Audit failed for ${testingMethod}: ${result}`);
        } else if (typeof result === "object" && result.accessibilityScore > 0) {
          return "Audit complete.";
        }
        throw new Error(`AuditOne handleAudit: Audit failed for ${testingMethod}: ${JSON.stringify(result)}`);
      });
      console.log(`Audit completed: ${result}`);
      setRunningStatus("finished");
      setTitleHeader("Audit Result");
    } catch (err) {
      console.error("handleAudit in AuditOne.jsx failed:", err);
      if (err.message === "Audit cancelled by user") {
        setRunningStatus("cancelled");
        setTitleHeader("Audit Cancelled");
        setErrorMessage("Audit was cancelled by the user.");
      } else {
        setRunningStatus("error");
        setTitleHeader("Audit Error");
        setErrorMessage(err.message || `Failed to audit ${fullUrl}.`);
      }
    }
  };

  const handleRunAgain = () => {
    setTitleHeader("Audit One Webpage")
    setRunningStatus("ready");
    setFullUrl("");
    setErrorMessage("");
    setIsCancelled(false);
  };

  const RunningScreen = () => (
    <VStack {...BodyVstackCss}>
      <h2>
        Auditing {pathName} through {testingMethod}{" "}
        {testingMethod === "all" ? "sizes" : ""}...
      </h2>
      <p>
        {testingMethod !== "all"
          ? "Tests usually take about 10-15 seconds to complete, depending on connection speed."
          : "Currently conducting 4 simultaneous tests with a width of 500, 900, 1280, and 1920. This test will likely take a minute to complete and can fail to initially connect."}
      </p>
      <p>
        {testingMethod !== "all" &&
          "If this page persists for longer than 30 seconds, please check your internet connection or try again."}
      </p>
      <button
        className="btn btn-main"
        onClick={handleCancelAudit}
      >
        Cancel Audit
      </button>
    </VStack>
  );

  const WarningScreen = () => (
    <VStack {...BodyVstackCss}>
      <h2>
        Auditing {pathName} through {testingMethod}{" "}
        {testingMethod === "all" ? "sizes" : ""}...
      </h2>
      <p>Attempting to reconnect to webpage after previous attempt failed.</p>
      <p>Trying again...</p>
      <button
        className="btn btn-main"
        onClick={handleCancelAudit}
      >
        Cancel Audit
      </button>
    </VStack>
  );

  const FinishedScreen = () => (
    <VStack {...BodyVstackCss}>
      <div>
        <h2>
          Completed {testingMethod} {testingMethod === "all" ? "sized " : ""}{" "}
          Audit for
        </h2>
        <h3>{fullUrl}.</h3>
      </div>
      <LinkButton
        destination="../../lists-menu/view-custom-audits"
        buttonText="Go To Audit File"
        buttonClass="btn btn-main"
      />
      <button className="btn btn-main" onClick={handleRunAgain}>
        Run Another Audit
      </button>
    </VStack>
  );

  const ErrorScreen = () => (
    <VStack {...BodyVstackCss}>
      <h3>Audit failed for {fullUrl}.</h3>
      <h4>{errorMessage}</h4>
      <h4>
        Please check for any typos in the URL, check your connection, and try
        again.
      </h4>
      <button className="btn btn-main" onClick={handleRunAgain}>
        Run Another Audit
      </button>
    </VStack>
  );

  const CancelledScreen = () => (
    <VStack {...BodyVstackCss}>
      <h3>Audit Cancelled for {fullUrl}</h3>
      <h4>{errorMessage}</h4>
      <button className="btn btn-main" onClick={handleRunAgain}>
        Run Another Audit
      </button>
    </VStack>
  );

  return (
    <VStack {...CenteredVstackCss}>
      <MenuHeader title={titleHeader} handleBackButton={handleCancelAudit} />
      {runningStatus === "ready" && (
        <ReadyScreen
          fullUrl={fullUrl}
          setFullUrl={setFullUrl}
          testingMethod={testingMethod}
          setTestingMethod={setTestingMethod}
          handleAudit={handleAudit}
          handleAllSizesAudit={handleAllSizesAudit}
        />
      )}
      {runningStatus === "running" && <RunningScreen />}
      {runningStatus === "warning" && <WarningScreen />}
      {runningStatus === "finished" && <FinishedScreen />}
      {runningStatus === "error" && <ErrorScreen />}
      {runningStatus === "cancelled" && <CancelledScreen />}
    </VStack>
  );
};

export default AuditOne;