/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import Select from '@mui/joy/Select'
import Option from '@mui/joy/Option'
import { networkSelectHook } from '../../hooks/networkSelectHook'

export const SelectNetwork: React.FC = () => {
  const [network, setNetwork] = networkSelectHook()

  return (
    <>
      <Select
        value={network}
        onChange={(_event, newNetwork: any) => {
          setNetwork(newNetwork)
        }}
        sx={{ width: 'max-content' }}
      >
        <Option value="mainnet">Mainnet</Option>
        <Option value="testnet">Preprod</Option>
      </Select>
    </>
  )
}
