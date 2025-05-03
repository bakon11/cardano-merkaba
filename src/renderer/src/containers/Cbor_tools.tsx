/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react'
import { CssVarsProvider } from '@mui/joy/'
import { TopBar } from '../components/TopBar/TopBar'
import { SideBar } from '../components/SideBar/SideBar'
import CssBaseline from '@mui/joy/CssBaseline'
import '@fontsource/space-grotesk'
import { CborHomeView } from '../components/CborTools/CborHomeView'
import { menuHook } from '../hooks/menuHook'
import { networkSelectHook } from '../hooks/networkSelectHook'

const Cbor_tools = (): JSX.Element => {
  const [menu, setMenu] = menuHook()
  const [network, setNetwork] = networkSelectHook()

  useEffect(() => {
    network === null && setNetwork('testnet')
  }, [])

  return (
    <>
      <CssVarsProvider>
        <CssBaseline />
        <TopBar />
        <SideBar />
       
        {menu === 'CborTools' && <CborHomeView />}
      </CssVarsProvider>
    </>
  )
}

export default Cbor_tools
