import React from 'react'
import { VStack, HStack, Menu } from '@chakra-ui/react'
import DefaultHstackSettings from '../reusables/DefaultHstackSettings'
import DefaultVstackSettings from '../reusables/defaultVstackSettings'
import MenuHeader from '../reusables/MenuHeader'
import LinkButton from '../reusables/LinkButton'

const AuditAll = () => {
  return (
    <VStack {...DefaultVstackSettings}>
        <MenuHeader title="View Lists" subTitle="Created by Jarod Day" />
    </VStack>
  )
}

export default AuditAll