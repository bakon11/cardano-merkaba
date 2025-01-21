/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { createStore } from 'reusable'

export const nodeHook = createStore(
  (): [string | null, (selectedNodeHook: string) => Promise<void>] => {
    // The function now explicitly returns a tuple of type [string | null, (networkSelect: string) => Promise<void>]

    const [nodeHook, setNodeHook] = useState<string | null>(
      localStorage.getItem('nodeHook')
    )
    const handleSelectNode = async (nodeHook: string): Promise<void> => {
      localStorage.setItem('nodeHook', nodeHook)
      setNodeHook(nodeHook)
    }

    return [nodeHook, handleSelectNode]
  }
)
