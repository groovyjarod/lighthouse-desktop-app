import React, { useEffect, useState } from 'react'
import { VStack } from '@chakra-ui/react'
import BodyVstackSettings from '../reusables/BodyVstackSettings'
import DefaultVstackSettings from '../reusables/defaultVstackSettings'

const DisplayAuditComparisons = () => {
    const [files, setFiles] = useState([])

    useEffect(() => {
        window.electronAPI.getAuditComparisons().then(setFiles).catch(console.error)
    }, [])
  return (
    <VStack {...DefaultVstackSettings}>
        <h2>Audit Comparisons Folder Content</h2>
        <VStack {...BodyVstackSettings}>
            {files.map((file, index) => (
                <div
                className="list-item"
                key={index}
                onClick={() => window.electronAPI.openResultsFile(file.name, 'audit-comparisons')}
                >
                    {file.name} - {file.size} bytes
                </div>
            ))}
        </VStack>
    </VStack>
  )
}

export default DisplayAuditComparisons