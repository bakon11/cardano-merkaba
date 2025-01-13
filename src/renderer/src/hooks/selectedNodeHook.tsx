/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { createStore } from 'reusable'

export const selectedNodeHook = createStore(
  (): [string | null, (selectedAccountHook: string) => Promise<void>] => {
    // The function now explicitly returns a tuple of type [string | null, (networkSelect: string) => Promise<void>]

    const [selectedAccountHook, setSelectedAccountHook] = useState<string | null>(
      localStorage.getItem('selectedAccountHook')
    )
    const handleSelectAccount = async (selectedAccountHook: string): Promise<void> => {
      localStorage.setItem('selectedAccountHook', selectedAccountHook)
      setSelectedAccountHook(selectedAccountHook)
    }

    return [selectedAccountHook, handleSelectAccount]
  }
)
