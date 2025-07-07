import React, { useState, useEffect } from 'react'
import { VStack, HStack, Menu } from '@chakra-ui/react'
import DefaultHstackSettings from '../reusables/DefaultHstackSettings'
import DefaultVstackSettings from '../reusables/defaultVstackSettings'
import MenuHeader from '../reusables/MenuHeader'
import LinkButton from '../reusables/LinkButton'

const AuditOne = () => {
  return (
    <VStack {...DefaultVstackSettings}>
        <MenuHeader title="Audit One Page" />
        <h2>Paste Webpage Link Here</h2>
        <label htmlFor="audit-link">Webpage Link</label>
        <input type="text" name="audit-link" />
        <button className='btn btn-main'>Start Audit</button>
    </VStack>
  )
}

export default AuditOne