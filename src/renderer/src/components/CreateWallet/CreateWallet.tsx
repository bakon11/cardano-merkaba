/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { Sheet, Typography, Button } from '@mui/joy'
import {
  genSeedPhrase,
  seedPhraseToEntropy,
  genRootPrivateKey,
  genAccountPrivatekey,
  genAddressPrivateKey,
  genAddressStakeKey,
} from '../../lib/cryptoPLUTS'
import { menuHook } from '../../hooks/menuHook'
import { fromBuffer, toBuffer } from '../../lib/utils'
import * as pluts from '@harmoniclabs/plu-ts'
import { blake2b_224 } from '@harmoniclabs/crypto'

export const CreateWallet: React.FC = () => {
  const [seedPhrase, setSeedPhrase] = React.useState<any>('')
  const [menu, setMenu] = menuHook()

  const genNewSeedPhrase = async (): Promise<any> => {
    // const seedPhrase: any = await genSeedPhrase()
    // console.log('seedPhrase', seedPhrase)
    // const seedPhraseTest = [ 'earth','unlock','drill','mirror','setup','economy','sphere','illegal','stamp','wedding','pill','act','desert','near','hidden','gadget','media','grass','join','wealth','acid','medal','segment','equal']
    const seedPhrase =
      'earth unlock drill mirror setup economy sphere illegal stamp wedding pill act desert near hidden gadget media grass join wealth acid medal segment equal'
    setSeedPhrase(seedPhrase)

    const entropy = await seedPhraseEntropy(seedPhrase)
    console.log('entropy', entropy)

    const rootKey: any = await rootPKey(entropy)
    console.log('rootKey', toBuffer(rootKey?.bytes))
    // console.log('rootKey', rootKey?.bytes)
    // console.log('rootKey', fromBuffer(toBuffer(rootKey?.bytes)))

    const accountKeyPrv = await accountPrivatekey(rootKey, 0)
    console.log('accountKeyPrv', accountKeyPrv.toString())
    // console.log('accountKeyPrv', toBuffer(accountKeyPrv.bytes))

    const accountKeyPub = accountKeyPrv.public()
    // console.log('accountKeyPub', accountKeyPub.bytes)
    // console.log('accountKeyPub', fromBuffer(toBuffer(accountKeyPub.bytes)))
    console.log('accountKeyPub', toBuffer(accountKeyPub.bytes))

    const accountAddressKeyPrv = await accountAddressPrivateKey(accountKeyPrv, 0)
    console.log('accountAddressKeyPrv', accountAddressKeyPrv)
    // console.log('accountAddressKeyPrv', toBuffer(accountAddressKeyPrv.bytes))

    const accountAddressKeyPub = accountAddressKeyPrv.public()
    console.log('accountAddressKeyPub: ', toBuffer(accountAddressKeyPub.bytes))
    
    const accountAddressStakeKeyPrv = await accountAddressStakeKey(accountKeyPrv, 0)
    console.log('accountAddressStakeKeyPrv', accountAddressStakeKeyPrv)
    // console.log('accountAddressStakeKeyPrv', toBuffer(accountAddressStakeKeyPrv.bytes))
    console.log(
      '###############################################################################################################'
    )

    console.log(
      '###############################################################################################################'
    )
    const addr: any = pluts.Address.fromEntropy(entropy, 'testnet')
    console.log('addr', addr)

    const baseAddress = new pluts.Address('testnet', addr.paymentCreds, addr.stakeCreds, 'base')
    console.log('base address entropy', baseAddress)
    console.log('base address entropy', baseAddress.toString())

    const stakeAddr = new pluts.StakeAddress('testnet', addr.stakeCreds.hash, 'stakeKey')
    console.log('stake address entropy', stakeAddr)
    console.log('stake address entropy', stakeAddr.toString())
    console.log(
      '###############################################################################################################'
    )

    console.log(
      '###############################################################################################################'
    )
    const addr2: any = pluts.Address.fromXPrv(accountAddressStakeKeyPrv, 'testnet')
    console.log('addr2', addr2)

    const baseAddress2 = new pluts.Address('testnet', addr2.paymentCreds, addr2.stakeCreds, 'base')
    console.log('base address2 xprv', baseAddress2)
    console.log('base address2 xprv', baseAddress2.toString())

    const stakeAddr2 = new pluts.StakeAddress('testnet', addr2.stakeCreds.hash, 'stakeKey')
    console.log('stake address2 xprv', stakeAddr2)
    console.log('stake address2 xprv', stakeAddr2.toString())
    console.log(
      '###############################################################################################################'
    )

    return seedPhrase
  }

  const seedPhraseEntropy = async (seedPhrase: any): Promise<any> => {
    return await seedPhraseToEntropy(seedPhrase)
  }

  const rootPKey = async (entropy: any): Promise<any> => {
    return await genRootPrivateKey(entropy)
  }

  const accountPrivatekey = async (rootKey: any, index: number): Promise<any> => {
    return await genAccountPrivatekey(rootKey as pluts.XPrv, index)
  }

  const accountAddressPrivateKey = async (accountKeyPrv: any, index: number): Promise<any> => {
    return await genAddressPrivateKey(accountKeyPrv, index)
  }
  const accountAddressStakeKey = async (accountKeyPrv: any, index: number): Promise<any> => {
    return await genAddressStakeKey(accountKeyPrv, index)
  }

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
        <h1>Seed Phrase</h1>
        <hr />
        <br />
        <p>
          <Typography level="body1" sx={{ textAlign: 'center' }}>
            Again, before you commit and generate your Seed phrase make sure you are the only one
            seeing it and are in a private space.
          </Typography>
        </p>
        <br />
        <Sheet sx={{ textAlign: 'center' }}>
          <Button variant="outlined" color="primary" onClick={genNewSeedPhrase}>
            Generate Seed Phrase
          </Button>
        </Sheet>
        <br />
        <Sheet>
          <Typography level="body1" sx={{ textAlign: 'center' }}>
            <SeedPhraseDisplay seedPhrase={seedPhrase} />
          </Typography>
        </Sheet>
      </Sheet>
      <Button variant="outlined" color="primary" onClick={() => setMenu('WalletView')}>
        Cancel
      </Button>
    </Sheet>
  )
}

interface SeedPhraseDisplayProps {
  seedPhrase: string | any
}

const SeedPhraseDisplay: React.FC<SeedPhraseDisplayProps> = ({ seedPhrase }) => {
  const words = seedPhrase.split(' ')

  return (
    <Sheet
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)', // 4 columns for 6 rows
        gap: 1, // gap between squares
        justifyContent: 'center',
        alignContent: 'center',
        padding: 2
      }}
    >
      {words.map((word, index) => (
        <Typography
          key={index}
          level="body1"
          sx={{
            textAlign: 'center',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 'sm',
            p: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {word}
        </Typography>
      ))}
    </Sheet>
  )
}
