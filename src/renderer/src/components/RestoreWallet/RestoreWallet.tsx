import * as React from 'react'
import { Sheet, Button } from '@mui/joy'
import {
  seedPhraseToEntropy,
  genSeedPhrase,
  genRootPrivateKey,
  genBaseAddressFromEntropy,
  genStakeAddressFromEntropy,
  encrypt
} from '../../lib/cryptoPLUTS'
import { networkSelectHook } from '../../hooks/networkSelectHook'
import * as pluts from '@harmoniclabs/plu-ts'
import { menuHook } from '../../hooks/menuHook'
import { CreateWalletAccounts } from './CreateWalletAccounts'
import { EnterSeedPhrase  } from './EnterSeedPhrase'


export const RestoreWallet: React.FC = () => {
  const saveNewWallet = (walletData: any): any => window.api.saveNewWallet(walletData)
  const saveNewAccount = (accountData: any): any => window.api.saveNewAccount(accountData)
  const saveNewAccountAddress = (addressData: any): any =>
    window.api.saveNewAccountAddress(addressData)

  const [seedPhrase, setSeedPhrase] = React.useState<string[]>(Array(24).fill(''))
  const [entropy, setEntropy] = React.useState<string>('')
  const [progress, setProgress] = React.useState<number>(0)
  const [network, setNetwork] = networkSelectHook()
  const [walletId, setWalletId] = React.useState<string>('')
  const [walletName, setWalletName] = React.useState<string>('')
  const [accountCount, setAccountCount] = React.useState<number>(1)
  const [accountsInfo, setAccountsInfo]: any[] = React.useState<[]>([])
  const [spendingPassword, setSpendingPassword] = React.useState<string>('')
  const [spendingPasswordCheck, setSpendingPasswordCheck] = React.useState<string>('')
  const [passwordMatch, setPasswordMatch] = React.useState<boolean>(false)
  const [verified, setVerified] = React.useState<boolean>(false)
  const [menu, setMenu] = menuHook()
  const [status, setStatus] = React.useState<string>('')

  // console.log('checking entropy wipe', entropy)

  const createNewWallet = async () => {
    const seedPhrase: any = await genSeedPhrase()

    //Don't get too excited it's just a random seed phrase used for testing :).
    // const seedPhrase = 'earth unlock drill mirror setup economy sphere illegal stamp wedding pill act desert near hidden gadget media grass join wealth acid medal segment equal'
    setSeedPhrase(seedPhrase)
    console.log('seedPhrase', seedPhrase)
    const entropy = seedPhraseToEntropy(seedPhrase)
    console.log('entropy', entropy)
    const prvKey: any = genRootPrivateKey(entropy)
    // console.log('prvKey', prvKey)
    const pubKey =  new pluts.PublicKey(prvKey.public().toPubKeyBytes()).toString()
    setWalletId(pubKey)
    setEntropy(entropy)
  }

  const updateAccounts = () => {
    // console.log('entrop', entropy)
    // Create a new array with accounts up to accountCount or less if accountsInfo has fewer elements
    const existingAccounts: any = accountsInfo.slice(0, accountCount)
    console.log('existingAccounts', existingAccounts)
    // Generate new accounts if needed
    const newAccounts: any = Array.from(
      { length: Math.max(0, accountCount - existingAccounts.length) },
      (_, i) => ({
        accountIndex: existingAccounts.length + i, // +1 because we're user-facing indices
        accountName: `Account ${existingAccounts.length + i}`,
        baseAddress: genBaseAddressFromEntropy(
          entropy,
          network as pluts.NetworkT,
          existingAccounts.length + i,
          0
        ).toString(),
        stakeAddress: genStakeAddressFromEntropy(
          entropy,
          network as pluts.NetworkT,
          existingAccounts.length + i,
          0
        ).toString()
      })
    )

    console.log('newAccounts', newAccounts)
    // Combine existing accounts with new ones without mutation
    setAccountsInfo([...existingAccounts, ...newAccounts])
    console.log('accountsInfo', accountsInfo)
  }

  const handelSetProgress = (back: boolean) => {
    progress === 0 && setProgress(progress + 1)

    if (back === false && progress === 1 && passwordMatch === false)
      return setStatus('Please make sure password field matches')
    if (back === false && progress === 1 && walletName === '')
      return setStatus('Please provide a name for your wallet')
    if (back === false && progress === 1 && accountCount === 0)
      return setStatus('please create at least one account')

    back === false && progress === 1 && setProgress(progress + 1)

    back === true && setProgress(progress - 1)
  }

  const saveWalletData = async () => {
    // Save wallet data to the database
    console.log('saving wallet data')
    console.log("accountsInfo", accountsInfo)
    const entropyEncrypted = encrypt(spendingPassword, entropy )
    console.log('entropyEncrypted', entropyEncrypted)
    
    const saveNewWalletRes = await saveNewWallet({ 
      entropyEncrypt: entropyEncrypted, 
      walletId: walletId, 
      walletName: walletName
    })
    console.log("saveNewWalletRes", saveNewWalletRes)
    saveNewWalletRes === 'ok' &&
    
    accountsInfo.map(async (account: any) => {
      // Save account data to the database
      console.log('saving account data')
      await saveNewAccount({
        walletId: walletId,
        accountIndex: account.accountIndex,
        accountName: account.accountName
      })

      // Save account address data to the database
      console.log('saving account address data')
      await saveNewAccountAddress({
        walletId: walletId,
        accountIndex: account.accountIndex,
        addressIndex: 0,
        baseAddress_bech32: account.baseAddress,
        stakeAddress_bech32: account.stakeAddress
      })
    })
    setStatus('Seed Phrase Verified, New wallet setup is complete')
    setTimeout( () => setMenu('ViewWallets'), 5000)
  }

  React.useEffect(() => {
    entropy !== '' && updateAccounts()
  }, [accountCount, entropy, network])

  return (
    <>
      <h1>Creating Wallet on {network}</h1>
      <Sheet
        sx={{
          top: 60,
          left: 60,
          width: 1200,
          height: 'auto',
          maxHeight: 800,
          overflowY: 'scroll',
          p: 4,
          bgcolor: 'background.body',
          color: 'text.primary'
        }}
      >
        <Button variant="outlined" color="primary" onClick={() => setMenu('WalletView')}>
          Cancel
        </Button>
        <Button variant="outlined" color="primary" onClick={() => saveWalletData()}>
          Test Save
        </Button>
      </Sheet>
    </>
  )
}
