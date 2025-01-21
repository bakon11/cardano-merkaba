/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { createStore } from 'reusable'

export const backendHook = createStore(
  (): [string | null, (backendHook: string) => Promise<void>] => {
    // The function now explicitly returns a tuple of type [string | null, (networkSelect: string) => Promise<void>]

    const [backendHook, setBackendHook] = useState<string>(
      localStorage.getItem('backendHook') || JSON.stringify(['','','',''])
    );
    const handleSelectBackend = async (backendHook: string): Promise<void> => {
      localStorage.setItem('backendHook', backendHook)
      setBackendHook(backendHook)
    }

    return [backendHook, handleSelectBackend]
  }
)
