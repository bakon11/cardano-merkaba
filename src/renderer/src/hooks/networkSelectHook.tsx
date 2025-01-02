/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { createStore } from 'reusable'

export const networkSelectHook = createStore(
  (): [string | null, (networkSelect: string) => Promise<void>] => {
    // The function now explicitly returns a tuple of type [string | null, (networkSelect: string) => Promise<void>]

    const [networkSelect, setNetworkSelect] = useState<string | null>(
      localStorage.getItem('networkSelect')
    )
    const handleSelectNetwork = async (networkSelect: string): Promise<void> => {
      localStorage.setItem('networkSelect', networkSelect)
      setNetworkSelect(networkSelect)
    }

    return [networkSelect, handleSelectNetwork]
  }
)
