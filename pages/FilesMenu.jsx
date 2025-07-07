import React, { useEffect, useState } from 'react'
import { VStack, HStack, Menu } from '@chakra-ui/react'
import DefaultHstackSettings from '../reusables/DefaultHstackSettings'
import DefaultVstackSettings from '../reusables/defaultVstackSettings'
import MenuHeader from '../reusables/MenuHeader'
import LinkButton from '../reusables/LinkButton'
import fileLogo from '../reusables/file.png'

const FilesMenu = () => {
  const [content, setContent] = useState('')
  const [status, setStatus] = useState(null)
  const [files, setFiles] = useState([])

  const handleReplaceFile = async () => {
    const result = await window.electronAPI.getCurrentFile()

    if (!result.success) {
      setStatus(`Error: ${result.error}`)
      return
    }

    const targetFile = result.filename
    const replaceResult = await window.electronAPI.replaceAuditFile(targetFile)

    if (replaceResult.success) {
      setStatus('Success!')
    } else {
      setStatus(`Error replacing file: ${replaceResult.error}`)
    }
  }

  useEffect(() => {
    window.electronAPI.getEditableFiles().then(setFiles).catch(console.error)
  }, [])

  return (
    <VStack {...DefaultVstackSettings}>
        <MenuHeader title="View and Change Files" subTitle="Settings" />
        <h2>Editable Files</h2>
        <HStack {...DefaultHstackSettings}>
          {files.map((file, index) => (
            <VStack className="settings-item"  key={index} gap="0px" onClick={handleReplaceFile}>
              {/* {console.log(files)}
              {console.log(files.length)}
              {console.log(files[0])}
              {console.log(typeof(files[0]))} */}
              <img src={fileLogo} alt="file logo" className='logo' />
              <h4>Change Paths File</h4>
              <div>
                <h4>{file.name}</h4>
                <p className="subtext">Current file</p>
              </div>
            </VStack>
          ))}
          {status && <p className='subText'>{status}</p>}
        </HStack>
    </VStack>
  )
}

export default FilesMenu