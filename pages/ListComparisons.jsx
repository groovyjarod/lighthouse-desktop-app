import React from 'react'
import { VStack, HStack, Menu } from '@chakra-ui/react'
import DefaultHstackSettings from '../reusables/DefaultHstackSettings'
import DefaultVstackSettings from '../reusables/defaultVstackSettings'
import MenuHeader from '../reusables/MenuHeader'
import LinkButton from '../reusables/LinkButton'
import BodyVstackSettings from '../reusables/BodyVstackSettings'
import DisplayAuditComparisons from '../Page_Logic/DisplayAuditComparisons'

const ListComparisons = () => {
  return (
    <VStack {...DefaultVstackSettings}>
        <MenuHeader title="Audit Comparisons" subTitle="Created by Jarod Day" />
        <VStack {...DefaultVstackSettings}>
          <VStack {...BodyVstackSettings}>
            <DisplayAuditComparisons />
          </VStack>
        </VStack>
    </VStack>
  )
}

export default ListComparisons