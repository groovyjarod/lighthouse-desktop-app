import React from 'react'
import { VStack, HStack, Menu } from '@chakra-ui/react'
import DefaultHstackSettings from '../reusables/DefaultHstackSettings'
import DefaultVstackSettings from '../reusables/defaultVstackSettings'
import BodyVstackSettings from '../reusables/BodyVstackSettings'
import MenuHeader from '../reusables/MenuHeader'
import LinkButton from '../reusables/LinkButton'

import DisplayAuditResults from '../Page_Logic/DisplayAuditResults'

const ListAudits = () => {
  return (
    <VStack {...DefaultVstackSettings} alignItems="start">
        <MenuHeader title="Current Audits" subTitle="Created by Jarod Day" />
        <VStack {...DefaultVstackSettings}>
          <VStack {...BodyVstackSettings}>
            <DisplayAuditResults />
          </VStack>
        </VStack>
    </VStack>
  )
}

export default ListAudits