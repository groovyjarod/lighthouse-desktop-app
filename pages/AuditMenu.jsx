import React from 'react'
import { VStack, HStack, Menu } from '@chakra-ui/react'
import DefaultVstackSettings from '../reusables/defaultVstackSettings'
import DefaultHstackSettings from '../reusables/DefaultHstackSettings'
import MenuHeader from '../reusables/MenuHeader'
import LinkButton from '../reusables/LinkButton'

const AuditMenu = () => {
  return (
    <VStack {...DefaultVstackSettings}>
      <MenuHeader title="Conduct an Audit" subTitle="Created by Jarod Day" headerText="Choose from the options below which type of audit you would like to conduct." />
      <h2>Audit Options</h2>
      <HStack {...DefaultHstackSettings}>
        <LinkButton destination="./test-all" buttonText="Test All" buttonClass="btn btn-menu btn-audit" />
        <LinkButton destination="./test-single" buttonText="Test One" buttonClass="btn btn-menu btn-audit" />
      </HStack>
      <HStack {...DefaultHstackSettings}>
        <LinkButton destination="./test-compare" buttonText="Compare Audits" buttonClass="btn btn-menu btn-audit" />
        <LinkButton destination="./test-report" buttonText="Create Report" buttonClass="btn btn-menu btn-audit" />
      </HStack>

    </VStack>
  )
}

export default AuditMenu