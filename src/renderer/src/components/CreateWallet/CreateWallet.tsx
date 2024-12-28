/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { Sheet, Typography, Button } from '@mui/joy'
import { seedPhraseToEntropy, genSeedPhrase } from '../../lib/cryptoPLUTS'
import { menuHook } from '../../hooks/menuHook'
// import { fromBuffer, toBuffer } from '../../lib/utils'
// import { StakeAddress } from '@harmoniclabs/cardano-ledger-ts'
// import { blake2b_224 } from '@harmoniclabs/crypto'
import * as pluts from '@harmoniclabs/plu-ts'

export const CreateWallet: React.FC = () => {
  const [seedPhrase, setSeedPhrase] = React.useState<any>('')
  const [entropy, setEntropy] = React.useState<any>('')
  const [baseAddress, setBaseAddress] = React.useState<any>('')
  const [stakeAddress, setStakeAddress] = React.useState<any>('')
  const [menu, setMenu] = menuHook()

  const genNewSeedPhrase = async (): Promise<any> => {
    const seedPhrase: any = await genSeedPhrase()
    console.log('seedPhrase', seedPhrase)
    // This seed phrase is strictly for testing purposes
    // const seedPhrase =
    //   'earth unlock drill mirror setup economy sphere illegal stamp wedding pill act desert near hidden gadget media grass join wealth acid medal segment equal'
    setSeedPhrase(seedPhrase)

    const entropy = await seedPhraseToEntropy(seedPhrase)
    console.log('entropy', entropy)

    const rootKey: any = pluts.XPrv.fromEntropy(entropy, '')
    console.log('rootKey', rootKey.toString())

    return seedPhrase
  }

  const genBaseAddress = async (entropy: any) => {
    const addressFromEntropy: any = pluts.Address.fromEntropy(entropy, 'testnet', 0, 0)
    console.log('addressFromEntropy', addressFromEntropy)

    const baseAddress = new pluts.Address(
      'testnet',
      addressFromEntropy.paymentCreds,
      addressFromEntropy.stakeCreds,
      'base'
    )
    console.log('base address entropy', baseAddress)
    console.log('base address entropy', baseAddress.toString())
    return baseAddress
  }

  const genStakeAddress = async (entropy: any) => {
    const addressFromEntropy: any = pluts.Address.fromEntropy(entropy, 'testnet', 0, 0)
    console.log('addressFromEntropy', addressFromEntropy)

    const stakeAddress = new pluts.Address(
      'testnet',
      addressFromEntropy.paymentCreds,
      addressFromEntropy.stakeCreds,
      'stake'
    )
    console.log('stake address entropy', stakeAddress)
    console.log('stake address entropy', stakeAddress.toString())
    return stakeAddress
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
