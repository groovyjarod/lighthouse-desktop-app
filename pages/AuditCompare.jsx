import React from 'react'
import { VStack, HStack, Menu } from '@chakra-ui/react'
import DefaultHstackSettings from '../reusables/DefaultHstackSettings'
import DefaultVstackSettings from '../reusables/defaultVstackSettings'
import MenuHeader from '../reusables/MenuHeader'
import LinkButton from '../reusables/LinkButton'

const AuditCompare = () => {
  return (
    <VStack {...DefaultVstackSettings}>
        <MenuHeader title="Compare Audits" />
    </VStack>
  )
}

export default AuditCompare