/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { CssVarsProvider } from '@mui/joy/'
import { TopBar } from '../components/TopBar/TopBar'
import { SideBar } from '../components/SideBar/SideBar'
import CssBaseline from '@mui/joy/CssBaseline'
import '@fontsource/space-grotesk'
import { ViewWallets } from '../components/WalletComponents/ViewWallets/ViewWallets'
import { CreateWallet } from '../components/WalletComponents/CreateWallet/CreateWallet'
import { RestoreWallet } from '../components/WalletComponents/RestoreWallet/RestoreWallet'
import { SelectedAccountView } from '../components/WalletComponents/ViewWallets/SelectedAccountView'
import { menuHook } from '../hooks/menuHook'

const Wallet = (): JSX.Element => {
  const [menu, setMenu] = menuHook()
  return (
    <>
      <CssVarsProvider>
        <CssBaseline />
        <TopBar />
        <SideBar />
        {menu === 'ViewWallets' && <ViewWallets />}
        {menu === 'CreateWallet' && <CreateWallet />}
        {menu === 'RestoreWallet' && <RestoreWallet />}
        {menu === 'SelectedAccountView' && <SelectedAccountView />}
      </CssVarsProvider>
    </>
  )
}

export default Wallet
