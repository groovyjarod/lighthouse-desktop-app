import React, { useEffect, useState } from 'react'
import { VStack } from '@chakra-ui/react'
import BodyVstackSettings from '../reusables/BodyVstackSettings'
import DefaultVstackSettings from '../reusables/defaultVstackSettings'

const DisplayOldAuditResults = () => {
    const [files, setFiles] = useState([])

    useEffect(() => {
        window.electronAPI.getOldAuditResults().then(setFiles).catch(console.error)
    }, [])
    return (
        <VStack {...DefaultVstackSettings}>
            <h2>Old Audit Results Contents</h2>
            <VStack {...BodyVstackSettings}>
                {files.map((file, index) => (
                    <div
                    className="list-item"
                    key={index}
                    onClick={() => window.electronAPI.openResultsFile(file.name, 'old-audit-results')}>
                        {file.name} - {file.size} bytes
                    </div>
                ))}
            </VStack>
        </VStack>
    )
}

export default DisplayOldAuditResults