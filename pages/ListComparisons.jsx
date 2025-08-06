import React from 'react'
import { VStack, HStack, Menu } from '@chakra-ui/react'
import CenteredHstackCss from '../reusables/CenteredHstackCss'
import CenteredVstackCss from '../reusables/CenteredVstackCss'
import MenuHeader from '../reusables/MenuHeader'
import LinkButton from '../reusables/LinkButton'
import BodyVstackCss from '../reusables/BodyVstackCss'
import DisplayAuditComparisons from '../Page_Logic/DisplayAuditComparisons'

const ListComparisons = () => {
  return (
    <VStack {...CenteredVstackCss}>
        <MenuHeader title="Audit Comparisons" />
        <VStack {...CenteredVstackCss}>
          <VStack {...BodyVstackCss}>
            <DisplayAuditComparisons />
          </VStack>
        </VStack>
    </VStack>
  )
}

export default ListComparisons