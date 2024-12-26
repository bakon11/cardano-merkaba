/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import Sheet from '@mui/joy/Sheet'
import { Typography } from '@mui/joy'

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
        {wallets.length > 0 ? (
          wallets.map((wallet: any) => (
            <li key={wallet.id}>
              <h2>{wallet.name}</h2>
              <p>{wallet.address}</p>
            </li>
          ))
        ) : (
          <WalletInfoFAQ />
        )}
      </ul>
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
      <h1>Wallet Info FAQ</h1>
      <hr />
      <br />
      <p>
        <Typography level="h2">What is a Wallet?</Typography>

        <Typography level="body1">
          In the blockchain/crupto world Cryptography is used to secure transactions and control the
          creation of new transactions. The transactions are tehn signed with your private key and
          broadcasted to the network. A wallet is a software that manages your private keys and
          allows you to interact with the blockchain. It also allows you to view all transacations
          coresponding to your Key.
        </Typography>
        <br />
        <Typography level="h2">Generating Keys?</Typography>
        <Typography level="body1">
          This is one fo the most important aspects of your wallet and the blockchain. The keys are
          usually generated through what's called a "Seed phrase", a seed phrase is a collection of
          usually 24 words in a specific order. This seed phrase is used to generate what's called a
          root private key which is used to generate Account keys.
          <br />
          <br />
          Now don't worry if you don't understand any of this as the wallet will handle all of this
          for you. Hence why it's important the importance of Wallet transperancy and needing to be
          able to run it off of you're own infrastructure.
          <br />
          <br />
          Again, the seed phrase is the most important part of your wallet, if you lose it you lose
          access to your funds. It's basically the only sure fire way to recover you wallet in the
          future or use it in another wallert.
        </Typography>
      </p>
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
