/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import Sheet from '@mui/joy/Sheet'

export const WalletView: React.FC = () => {
  const fetchWalletData = (): any => window.api.getWalletDBData()
  const [wallets, setWallets] = React.useState<any>([])

  const walletData = async (): Promise<any> => {
    try {
      const data = await fetchWalletData()
      console.log('data', data)
      setWallets(data)
      return data
    } catch (e) {
      console.log(e)
    }
  }

  React.useEffect(() => {
    walletData()
  }, [])

  return (
    <Sheet
      sx={{
        top: 60,
        left: 60,
        width: 1200,
        height: 800,
        overflowY: 'auto',
        p: 4,
        bgcolor: 'background.body',
        color: 'text.primary'
      }}
    >
      <h1>Wallets</h1>
      <ul>
        {wallets.length > 0
          ? wallets.map((wallet: any) => (
              <li key={wallet.id}>
                <h2>{wallet.name}</h2>
                <p>{wallet.address}</p>
              </li>
            ))
          : 'No wallets found, you can either restore an existing wallet or create a new one from teh above menu.'}
      </ul>
    </Sheet>
  )
}

// const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
// ipcHandle();
/*
  const getDbData = (): any => window.api.getAllData()

  const getDbDataAll = async () => {
    try {
      const data = await getDbData()
      console.log('data', data)
      return data
    } catch (e) {
      console.log(e)
    }
  }

  const genNewSeedPhrase = async () => {
    const seedPhrase = await genSeedPhrase()
    console.log('seedPhrase', seedPhrase)
    return seedPhrase
  }

  React.useEffect(() => {
    getDbDataAll()
    genNewSeedPhrase()
  }, [])
  */
