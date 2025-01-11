/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { CssVarsProvider } from '@mui/joy/'
import { TopBar } from '../components/TopBar/TopBar'
import { SideBar } from '../components/SideBar/SideBar'
import CssBaseline from '@mui/joy/CssBaseline'
import '@fontsource/space-grotesk'
import { MainHomeView } from '../components/MainHomeView/MainHomeView'
import { ViewWallets } from '../components/ViewWallets/ViewWallets'
import { CreateWallet } from '../components/CreateWallet/CreateWallet'
import { RestoreWallet } from '../components/RestoreWallet/RestoreWallet'
import { SelectedAccountView } from '../components/ViewWallets/SelectedAccountView'
import { menuHook } from '../hooks/menuHook'

const App = (): JSX.Element => {
  const [menu, setMenu] = menuHook()
  return (
    <>
      <CssVarsProvider>
        <CssBaseline />
        <TopBar />
        <SideBar />
        {menu === 'MainHomeView' && <MainHomeView />}
        {menu === 'ViewWallets' && <ViewWallets />}
        {menu === 'CreateWallet' && <CreateWallet />}
        {menu === 'RestoreWallet' && <RestoreWallet />}
        {menu === 'SelectedAccountView' && <SelectedAccountView />}
      </CssVarsProvider>
    </>
  )
}

export default App
