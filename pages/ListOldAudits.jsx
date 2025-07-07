import React from 'react'
import { VStack, HStack, Menu } from '@chakra-ui/react'
import DefaultHstackSettings from '../reusables/DefaultHstackSettings'
import DefaultVstackSettings from '../reusables/defaultVstackSettings'
import MenuHeader from '../reusables/MenuHeader'
import LinkButton from '../reusables/LinkButton'
import BodyVstackSettings from '../reusables/BodyVstackSettings'
import DisplayOldAuditResults from '../Page_Logic/DisplayOldAuditResults'

const ListOldAudits = () => {
  return (
    <VStack {...DefaultVstackSettings}>
        <MenuHeader title="Old Audits" subTitle="Created by Jarod Day" />
        <VStack {...DefaultVstackSettings}>
          <VStack {...BodyVstackSettings}>
            <DisplayOldAuditResults />
          </VStack>
        </VStack>
    </VStack>
  )
}

export default ListOldAudits