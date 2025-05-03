import * as React from 'react'
import { Tab, Tabs, TabList, TabPanel } from '@mui/joy'
import { CborDecoder } from './CborDecoder'

export const CborHomeTabs: React.FC = () => {
  return (
    <Tabs orientation="vertical" size="sm">
      <TabList>
        <Tab variant="outlined" color="neutral">
          CBOR Decoder
        </Tab>
        <Tab variant="outlined" color="neutral">
          CBOR Encoder
        </Tab>
        <Tab variant="outlined" color="neutral">
          CBOR Generator
        </Tab>
      </TabList>
      <TabPanel value={0}>
        <CborDecoder />
      </TabPanel>
      <TabPanel value={1}>

      </TabPanel>
      <TabPanel value={2}>

      </TabPanel>
    </Tabs>
  )
}