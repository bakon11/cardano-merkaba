/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import Sheet from '@mui/joy/Sheet'
import { Typography } from '@mui/joy'
import { WalletSelectionTable } from './WalletSelectionTable'
import { menuHook } from '../../../hooks/menuHook'

export const ViewWallets: React.FC = () => {
  const getAllWallets = (): any => window.api.getAllWallets()
  const [ wallets, setWallets ] = React.useState<any>([])
  const [ menu, setMenu ] = menuHook()
  

  const getAllWalletsFromDb = async (): Promise<any> => {
    try {
      const data = await getAllWallets()
      console.log('data', data)
      setWallets(data)
      return data
    } catch (e) {
      console.log(e)
    }
  }

  React.useEffect(() => {
    getAllWalletsFromDb()
  }, [])

  return (
    <Sheet
      sx={{
        top: 20,
        left: 60,
        width: "80vw",
        height: 800,
        overflowY: 'auto',
        p: 4,
        bgcolor: 'background.body',
        color: 'text.primary'
      }}
    >
      <Typography level="h2" mb={3}>
        Wallets
      </Typography>
     
        { menu === "ViewWallets" && wallets.length > 0 ? (
         <WalletSelectionTable accounts={wallets} />
        ) : (
          <WalletInfoFAQ />
        )}
    </Sheet>
  )
}

const WalletInfoFAQ: React.FC = () => {
  return (
    <Sheet
      sx={{
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        p: 1,
        bgcolor: 'background.body',
        color: 'text.primary'
      }}
    >
      <Typography level="h2" mb={3} textAlign="center">
        Wallet Info FAQ
      </Typography>
      <hr />
      <br />
      <Typography level="h2">What is a Wallet?</Typography>

      <Typography level="body-md">
        In the blockchain/crypto world, cryptography is used to secure transactions and control the
        creation of new units. Transactions are then signed with your private key and broadcasted to
        the network. A wallet is software that manages your private keys and allows you to interact
        with the blockchain. It also enables you to view all transactions corresponding to your key.
      </Typography>
      <br />
      <Typography level="h2">Generating Keys?</Typography>
      <Typography level="body-md">
        This is one of the most important aspects of your wallet and the blockchain. Keys are
        usually generated through what's called a "Seed phrase"; a seed phrase is a collection of
        typically 24 words in a specific order. This seed phrase is used to generate what's known as
        a root private key, which then generates account keys. Don't worry if you don't understand
        any of this; the wallet will handle all of this for you. This underscores the importance of
        wallet transparency and the ability to run it on your own infrastructure. Again, the seed
        phrase is the most crucial part of your wallet. If you lose it, you lose access to your
        funds. It's essentially the only sure-fire way to recover your wallet in the future or use
        it in another wallet.
      </Typography>
    </Sheet>
  )
}

//(): void => window.electron.ipcRenderer.send('ping')
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
