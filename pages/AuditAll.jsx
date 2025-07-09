import React, { useEffect, useState } from 'react'
import { VStack, HStack, Menu, Text } from '@chakra-ui/react'
import DefaultHstackSettings from '../reusables/DefaultHstackSettings'
import DefaultVstackSettings from '../reusables/defaultVstackSettings'
import MenuHeader from '../reusables/MenuHeader'
import LinkButton from '../reusables/LinkButton'

const AuditAll = () => {
  const [file, setFile] = useState([])
  const [filename, setFilename] = useState('')
  useEffect(() => {
    window.electronAPI.getEditableFiles().then(setFile).catch(console.error)
  }, [])

  useEffect(() => {
    if (file.length > 0 && file[0].name) {
      setFilename(file[0].name)
    }
  }, [file])

  return (
    <VStack {...DefaultVstackSettings}>
        <MenuHeader title="Audit All Pages" />
        <h2>Pulling paths from: {filename} </h2>
        <Text maxw="90%">Based on your computer's memory, the recommended limit for concurrent tests is 6.</Text>
        <Text>How many tests would you like to run concurrently?</Text>
        <label htmlFor="number-link">Number of Concurrent Audits</label>
        <input type="text" name="number-link" />
        <button className="btn btn-main">Start All Audits</button>
    </VStack>
  )
}

export default AuditAll