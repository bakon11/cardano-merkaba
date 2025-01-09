/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import Select from '@mui/joy/Select'
import Option from '@mui/joy/Option'
import { networkSelectHook } from '../../hooks/networkSelectHook'

export const SelectNetwork: React.FC = () => {
  const [network, setNetwork] = networkSelectHook()
  const setupWalletTables = ( network: string ): void => window.api.setupWalletTables( network )

  const handleSetNetwork = ( newNetwork: any) => {
    console.log("network", newNetwork)
    setNetwork(newNetwork)
    setupWalletTables(newNetwork)
  }

  React.useEffect(() => {
    handleSetNetwork("testnet")
  }, [])

  return (
    <>
      <Select
        value={network}
        onChange={(_event, newNetwork: any) => {
          handleSetNetwork(newNetwork)
        }}
        sx={{ width: 'max-content' }}
      >
        <Option value="mainnet">Mainnet</Option>
        <Option value="testnet">Testnet</Option>
      </Select>
    </>
  )
}
