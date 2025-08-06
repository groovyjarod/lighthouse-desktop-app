import React, { useEffect, useState } from "react";
import { VStack, HStack } from "@chakra-ui/react";
import BodyVstackCss from "../reusables/BodyVstackCss";
import CenteredVstackCss from "../reusables/CenteredVstackCss";

const DisplayAuditComparisons = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    window.electronAPI
      .getAuditComparisons()
      .then(async (files) => {
        const withMetadata = await Promise.all(
          files.map(async (file) => {
            const metadata = await window.electronAPI.getAuditMetadata(
              "audit-comparisons",
              file.name
            );
            return { ...file, metadata };
          })
        );
        setFiles(withMetadata);
      })
      .catch(console.error);
  }, []);
  return (
    <VStack {...CenteredVstackCss}>
      <h2>Audit Comparisons Folder Content</h2>
      <HStack width="95%" justifyContent="space-between">
        <h3>Name</h3>
        <HStack minW="48%" width="48%" justifyContent="space-between">
          <h3>Items</h3>
          <h3>SubItems</h3>
          <h3>Score</h3>
          <h3>length</h3>
        </HStack>
      </HStack>
      <VStack {...BodyVstackCss}>
        {files.map((file, index) => {
          const metadata = file.metadata;
          return (
            <div
              className="list-item"
              key={index}
              onClick={() =>
                window.electronAPI.openResultsFile(
                  file.name,
                  "audit-comparisons"
                )
              }
            >
              <HStack width="95%" justifyContent="space-between">
                <p className="scroll-hidden list-name">{file.name}</p>
                <HStack maxW="50%" width="49%" justifyContent="space-between">
                  <p>{metadata.itemCount}</p>
                  <p>{metadata.subItemCount}</p>
                  <p>{metadata.score}</p>
                  <p>{metadata.length}</p>
                </HStack>
              </HStack>
            </div>
          );
        })}
        <div className="page-spacer"></div>
      </VStack>
    </VStack>
  );
};

export default DisplayAuditComparisons;
