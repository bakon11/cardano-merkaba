/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { CssVarsProvider } from '@mui/joy/'
import { TopBar } from '../components/TopBar/TopBar'
import { SideBar } from '../components/SideBar/SideBar'
import { PromptInputInterface } from '../components/AiAgent/PromptInputInterface'
import { menuHook } from '../hooks/menuHook'
import CssBaseline from '@mui/joy/CssBaseline'
import '@fontsource/space-grotesk'

const AiAgentMain = (): JSX.Element => {
  const [menu, setMenu] = menuHook()
  return (
    <>
      <CssVarsProvider>
        <CssBaseline />
        <TopBar />
        <SideBar />
        {menu === 'AiAgentMain' && <PromptInputInterface />}
      </CssVarsProvider>
    </>
  )
}

export default AiAgentMain
