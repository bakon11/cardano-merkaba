/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { createStore } from 'reusable'

export const ogmiosHook = createStore(
  (): [string | null, (ogmiosHook: string) => Promise<void>] => {
    // The function now explicitly returns a tuple of type [string | null, (networkSelect: string) => Promise<void>]

    const [ogmiosHook, setOgmiosHook] = useState<string | null>(
      localStorage.getItem('ogmiosHook')
    )
    const handleSelectOgmios= async (ogmiosHook: string): Promise<void> => {
      localStorage.setItem('ogmiosHook', ogmiosHook)
      setOgmiosHook(ogmiosHook)
    }

    return [ogmiosHook, handleSelectOgmios]
  }
)

export const ogmiosApiHeaderHook = createStore(
  (): [string | null, (ogmiosApiHeaderHook: string) => Promise<void>] => {
    // The function now explicitly returns a tuple of type [string | null, (networkSelect: string) => Promise<void>]

    const [ogmiosApiHeaderHook, setOgmiosApiHeaderHook] = useState<string | null>(
      localStorage.getItem('selectedAccountHook')
    )
    const handleSelectOgmiost = async (ogmiosApiHeaderHook: string): Promise<void> => {
      localStorage.setItem('ogmiosApiHeaderHook', ogmiosApiHeaderHook)
      setOgmiosApiHeaderHook(ogmiosApiHeaderHook)
    }

    return [ogmiosApiHeaderHook, handleSelectOgmiost]
  }
)

export const ogmiosApiKeyHook = createStore(
  (): [string | null, (ogmiosApiKeyHook: string) => Promise<void>] => {
    // The function now explicitly returns a tuple of type [string | null, (networkSelect: string) => Promise<void>]

    const [ogmiosApiKeyHook, setOgmiosApiKeyHook] = useState<string | null>(
      localStorage.getItem('ogmiosApiKeyHook')
    )
    const handleSetOgmiosApiKeyHook = async (ogmiosApiKeyHook: string): Promise<void> => {
      localStorage.setItem('ogmiosApiKeyHook', ogmiosApiKeyHook)
      setOgmiosApiKeyHook(ogmiosApiKeyHook)
    }

    return [ogmiosApiKeyHook, handleSetOgmiosApiKeyHook]
  }
)