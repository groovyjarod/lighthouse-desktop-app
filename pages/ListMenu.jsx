import React from 'react'
import { VStack, HStack } from '@chakra-ui/react'
import DefaultHstackSettings from '../reusables/DefaultHstackSettings'
import DefaultVstackSettings from '../reusables/defaultVstackSettings'
import MenuHeader from '../reusables/MenuHeader'
import LinkButton from '../reusables/LinkButton'

const ListMenu = () => {
  return (
    <VStack {...DefaultVstackSettings}>
        <MenuHeader title="View Lists" subTitle="Created by Jarod Day" />
        <h2>List Options</h2>
        <HStack {...DefaultHstackSettings}>
            <LinkButton destination="./view-audits" buttonText="View Audits" buttonClass="btn btn-menu btn-view" />
            <LinkButton destination="./view-old-audits" buttonText="View Old Audits" buttonClass="btn btn-menu btn-view" />
        </HStack>
        <HStack {...DefaultHstackSettings}>
            <LinkButton destination="./view-comparisons" buttonText="View Comparison" buttonClass="btn btn-menu btn-view" />
            <LinkButton destination="../test-menu/test-report" buttonText="View Audit Report" buttonClass="btn btn-menu btn-audit" />
        </HStack>
    </VStack>
  )
}

export default ListMenu