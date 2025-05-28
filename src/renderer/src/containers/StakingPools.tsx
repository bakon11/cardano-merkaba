/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { CssVarsProvider } from '@mui/joy/'
import { TopBar } from '../components/TopBar/TopBar'
import { SideBar } from '../components/SideBar/SideBar'
import CssBaseline from '@mui/joy/CssBaseline'
import { StakePools } from '../components/StakePools/StakePools'
import { menuHook } from '../hooks/menuHook'
import '@fontsource/space-grotesk'

const StakingPools = (): JSX.Element => {
  const [menu, setMenu] = menuHook()
  return (
    <>
      <CssVarsProvider>
        <CssBaseline />
        <TopBar />
        <SideBar />
        {menu === 'StakingPools' && <StakePools />}
      </CssVarsProvider>
    </>
  )
}

export default StakingPools
