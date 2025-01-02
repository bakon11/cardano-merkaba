/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { Sheet, Typography, Button } from '@mui/joy'
import {
  seedPhraseToEntropy,
  genSeedPhrase,
  genBaseAddressFromEntropy,
  genStakeAddressFromEntropy
} from '../../lib/cryptoPLUTS'
import { menuHook } from '../../hooks/menuHook'
import { networkSelectHook } from '../../hooks/networkSelectHook'
import * as pluts from '@harmoniclabs/plu-ts'
import { Input } from '@mui/joy'

export const CreateWallet: React.FC = () => {
  const [seedPhrase, setSeedPhrase] = React.useState<any>('')
  const [entropy, setEntropy] = React.useState<string>('')
  const [progress, setProgress] = React.useState<number>(0)
  const [network, setNetwork] = networkSelectHook()
  const [walletName, setWalletName] = React.useState<string>('')
  const [accountCount, setAccountCount] = React.useState<number>(0)
  const [accountsInfo, setAccountsInfo]: any[] = React.useState<[]>([])
  const [spendingPassword, setSpendingPassword] = React.useState<string>('')
  const [spendingPasswordCheck, setSpendingPasswordCheck] = React.useState<string>('')
  const [passwordMatch, setPasswordMatch] = React.useState<boolean>(false)
  const [error, setError] = React.useState<number>(0)
  const [status, setStatus] = React.useState<string>('')

  const createNewWallet = async () => {
    const seedPhrase: any = await genSeedPhrase()
    setSeedPhrase(seedPhrase)
    console.log('seedPhrase', seedPhrase)
    const entropy = await seedPhraseToEntropy(seedPhrase)
    console.log('entropy', entropy)
    setEntropy(entropy)
  }

  const updateAccounts = () => {
    console.log('entrop', entropy)
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

  const handelSetProgress = () => {
    progress === 0 && setProgress(progress + 1)

    if (progress === 1 && passwordMatch === false)
      return setStatus('Please make sure password field matches')
    if (progress === 1 && walletName === '')
      return setStatus('Please provide a name for your wallet')
    if (progress === 1 && accountCount === 0) return setStatus('please create at least one account')

    progress === 1 && setProgress(progress + 1)
  }

  React.useEffect(() => {
    entropy !== '' && updateAccounts()
  }, [accountCount])

  return (
    <>
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
        <h1>Creating Wallet on {network}</h1>
        {progress === 0 && (
          <SeedPhraseDisplay
            seedPhrase={seedPhrase}
            createNewWallet={createNewWallet}
            handelSetProgress={handelSetProgress}
          />
        )}
        {progress === 1 && (
          <CreateWalletAccounts
            accountCount={accountCount}
            setAccountCount={setAccountCount}
            spendingPassword={spendingPassword}
            setSpendingPassword={setSpendingPassword}
            spendingPasswordCheck={spendingPasswordCheck}
            setSpendingPasswordCheck={setSpendingPasswordCheck}
            passwordMatch={passwordMatch}
            setPasswordMatch={setPasswordMatch}
            walletName={walletName}
            setWalletName={setWalletName}
            accountsInfo={accountsInfo}
            handelSetProgress={handelSetProgress}
            status={status}
          />
        )}
      </Sheet>
    </>
  )
}

interface SeedPhraseDisplayProps {
  seedPhrase: string | any
  createNewWallet: () => void
  handelSetProgress: () => void
}

const SeedPhraseDisplay: React.FC<SeedPhraseDisplayProps> = ({
  seedPhrase,
  createNewWallet,
  handelSetProgress
}) => {
  const words = seedPhrase.split(' ')
  const [menu, setMenu] = menuHook()
  // console.log('words', words)
  return (
    <>
      <Sheet
        sx={{
          top: 0,
          left: 0,
          width: '100%',
          height: 'auto',
          p: 1,
          bgcolor: 'background.body',
          color: 'text.primary'
        }}
      >
        <Typography level="h1" sx={{ textAlign: 'center' }}>
          Seed Phrase
        </Typography>
        <hr />
        <br />
        <p>
          <Typography level="body-md" sx={{ textAlign: 'left' }}>
            Again, before you generate your Seed phrase make sure you are the only one seeing it and
            are in a private space, where no one can peek over your shoulder.
          </Typography>
          <br />
          <Typography level="body-md" sx={{ textAlign: 'left' }}>
            Make sure you keep the seed phrase only where you can access it. Probably a bad idea to
            store it electronically or using something like a password manager.
          </Typography>
        </p>
        <br />
        <Sheet>
          <Typography level="body-md" sx={{ textAlign: 'center' }}>
            {words.length > 1 && (
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
                {words.map((word: string, index: number) => (
                  <Typography
                    key={index}
                    level="body-md"
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
            )}
          </Typography>
        </Sheet>
        <Sheet sx={{ textAlign: 'center' }}>
          {seedPhrase === '' && (
            <Button variant="outlined" color="primary" onClick={() => createNewWallet()}>
              Generate Seed Phrase
            </Button>
          )}
        </Sheet>
        <Sheet
          sx={{
            mt: 5, // Margin top to separate from the first sheet if needed
            display: 'flex',
            justifyContent: 'space-between',
            width: 'auto',
            p: 2
            // bgcolor: 'background.body'
          }}
        >
          <Button variant="outlined" color="primary" onClick={() => setMenu('WalletView')}>
            Cancel
          </Button>
          {seedPhrase !== '' && (
            <Button variant="outlined" color="primary" onClick={() => handelSetProgress()}>
              Continue
            </Button>
          )}
        </Sheet>
      </Sheet>
    </>
  )
}

interface CreateWalletAccountsProps {
  accountCount: number | any
  setAccountCount: (accountCount: number) => void
  spendingPassword: string | any
  setSpendingPassword: (spendingPassword: string) => void
  spendingPasswordCheck: string | any
  setSpendingPasswordCheck: (spendingPasswordCheck: string) => void
  passwordMatch: boolean | any
  setPasswordMatch: (passwordMatch: boolean) => void
  walletName: string | any
  setWalletName: (walletName: string) => void
  accountsInfo: any[]
  handelSetProgress: () => void
  status: string | any
}

const CreateWalletAccounts: React.FC<CreateWalletAccountsProps> = ({
  accountCount,
  setAccountCount,
  spendingPassword,
  setSpendingPassword,
  spendingPasswordCheck,
  setSpendingPasswordCheck,
  passwordMatch,
  setPasswordMatch,
  walletName,
  setWalletName,
  accountsInfo,
  handelSetProgress,
  status
}) => {
  const [menu, setMenu] = menuHook()

  const handleCheckPassword = () => {
    if (spendingPassword === spendingPasswordCheck && spendingPassword !== '') {
      setPasswordMatch(true)
      console.log('passwords match')
    } else {
      setPasswordMatch(false)
      console.log('passwords do not')
    }
  }
  React.useEffect(() => {
    handleCheckPassword()
  }, [spendingPassword, spendingPasswordCheck])

  return (
    <Sheet
      sx={{
        top: 0,
        left: 0,
        width: '100%',
        height: 'auto',
        p: 1,
        bgcolor: 'background.body',
        color: 'text.primary'
      }}
    >
      <Typography level="h1" sx={{ textAlign: 'center' }}>
        Cardano Accounts and Addresses
      </Typography>
      <hr />
      <br />
      <p>
        <Sheet sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography level="body-md" sx={{ textAlign: 'left' }}>
            Please provide a name for your wallet.
          </Typography>
          <Input
            value={walletName}
            onChange={(event) => setWalletName(event.target.value)}
            placeholder="My Wallet"
            sx={{ width: '200px' }}
          />
        </Sheet>
        <br />
        <hr />
        <br />
        <Typography level="body-md" sx={{ textAlign: 'left' }}>
          Please provide a spending password, this password will be used to encyryt your private
          keys to sign transacations. You will have to provide it everytime you're going to be doing
          an onchain transaction.
        </Typography>
        <br />
        <Sheet sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Input
            value={spendingPassword}
            onChange={(event) => setSpendingPassword(event.target.value)}
            placeholder=""
            sx={{
              width: '200px',
              borderColor: passwordMatch && spendingPassword !== '' ? 'green' : 'red'
            }}
          />
          <Input
            value={spendingPasswordCheck}
            onChange={(event) => setSpendingPasswordCheck(event.target.value)}
            placeholder=""
            sx={{
              width: '200px',
              borderColor: passwordMatch && spendingPasswordCheck !== '' ? 'green' : 'red'
            }}
          />
        </Sheet>
      </p>
      <br />
      <hr />
      <br />
      <p>
        <Sheet sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography level="body-md" sx={{ textAlign: 'left' }}>
            Please select how many accounts do you want to create?.
          </Typography>
          <Input
            value={accountCount}
            type="number"
            min="0"
            onChange={(event: any) => setAccountCount(event.target.value)}
            placeholder="1"
            sx={{ width: '65px' }}
          />
        </Sheet>
        <br />
        <Typography level="body-md" sx={{ textAlign: 'left' }}>
          Each account allows you to have its own set of stake keys so you can do multi pool
          delegations using a single seed phrase. Each account has to be individually funded.
        </Typography>
        <br />
        <Typography level="body-md" sx={{ textAlign: 'left' }}>
          Upside to this, is you only have to remember one seed phrase for all your accounts. the
          downside is that if you lose your seed phrase, you lose all your accounts.
        </Typography>
        <br />
        <hr />
        <Typography level="h1" sx={{ textAlign: 'center' }}>
          Accounts: {accountCount}
        </Typography>
        {accountsInfo &&
          accountsInfo.map((account, index) => (
            <Sheet sx={{ border: '1px solid white', margin: 1 }} key={index}>
              <p>Account Index: {account.accountIndex}:</p>
              <p>Account Name: {account.accountName}:</p>
              <p>Base Address: {account.baseAddress}</p>
              <p>Stake Address: {account.stakeAddress}</p>
            </Sheet>
          ))}
      </p>
      <Sheet
        sx={{
          mt: 5, // Margin top to separate from the first sheet if needed
          display: 'flex',
          justifyContent: 'space-between',
          width: 'auto',
          p: 2
          // bgcolor: 'background.body'
        }}
      >
        <Button variant="outlined" color="primary" onClick={() => setMenu('WalletView')}>
          Cancel
        </Button>
        {status !== '' && (
          <Typography level="body-md" sx={{ textAlign: 'center' }}>
            {status}
          </Typography>
        )}
        <Button variant="outlined" color="primary" onClick={() => handelSetProgress()}>
          Continue
        </Button>
      </Sheet>
    </Sheet>
  )
}

const verifySeedPhrase = (seedPhrase: string) => {
  
}