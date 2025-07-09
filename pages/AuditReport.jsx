import React, { useState, useEffect } from 'react'
import { VStack, HStack, Menu } from '@chakra-ui/react'
import DefaultHstackSettings from '../reusables/DefaultHstackSettings'
import DefaultVstackSettings from '../reusables/defaultVstackSettings'
import MenuHeader from '../reusables/MenuHeader'
import LinkButton from '../reusables/LinkButton'

const loadingScreen = () => {
  return (
    <VStack {...DefaultVstackSettings}>
      
    </VStack>
  )
}

const finalizedScreen = () => {
  return (
    <VStack {...DefaultVstackSettings}>
      <h3>Your report has been finalized. Click below to view report.</h3>
      <LinkButton destination="./ListReport.jsx" buttonText="View Report" buttonClass="btn btn-main btn-audit" />
    </VStack>
  )
}

const AuditReport = () => {

  useEffect(() => {
    console.log('big booty bitches')
  }, [])
  return (
    <VStack {...DefaultVstackSettings}>
        <MenuHeader title="Report For All Audits" />
    </VStack>
  )
}

export default AuditReport