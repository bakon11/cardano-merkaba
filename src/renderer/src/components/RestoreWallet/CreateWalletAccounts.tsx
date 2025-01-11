import * as React from 'react'
import { Sheet, Typography, Button } from '@mui/joy'
import { Input } from '@mui/joy'
import { menuHook } from '../../hooks/menuHook'

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
  handelSetProgress: (back: boolean) => void
  status: string | any
  setStatus: (status: string) => void
}

export const CreateWalletAccounts: React.FC<CreateWalletAccountsProps> = ({
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
  setStatus,
  status
}) => {
  const [menu, setMenu] = menuHook()

  const handleCheckPassword = () => {
    if (spendingPassword === spendingPasswordCheck && spendingPassword !== '') {
      setPasswordMatch(true)
      setStatus('Passwords Match')
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
          Cardano Accounts and Addresses
        </Typography>
        <hr />
        <br />
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
          keys to sign transacations. You will have to provide it everytime youre going to be doing
          an onchain transaction.
        </Typography>
        <br />
        <Sheet sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Input
            value={spendingPassword}
            onChange={(event) => setSpendingPassword(event.target.value)}
            placeholder=""
            type="password"
            sx={{
              width: '200px',
              borderColor: passwordMatch && spendingPassword !== '' ? 'green' : 'red'
            }}
          />
          <Input
            value={spendingPasswordCheck}
            onChange={(event) => setSpendingPasswordCheck(event.target.value)}
            placeholder=""
            type="password"
            sx={{
              width: '200px',
              borderColor: passwordMatch && spendingPasswordCheck !== '' ? 'green' : 'red'
            }}
          />
        </Sheet>
        <br />
        <hr />
        <br />
        <Sheet sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography level="body-md" sx={{ textAlign: 'left' }}>
            Please select how many accounts do you want to create?.
          </Typography>
          <Input
            value={accountCount}
            type="number"
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
            <Sheet
              sx={{
                mt: 1, // Margin top to separate from the first sheet if needed
                width: 'auto',
                p: 2,
              }}
              key={index}
            >
              <Typography>Account Index: {account.accountIndex}:</Typography>
              <Typography>Account Name: {account.accountName}:</Typography>
              <Typography>Base Address: {account.baseAddress}</Typography>
              <Typography>Stake Address: {account.stakeAddress}</Typography>
            </Sheet>
          ))}
        <Sheet
          sx={{
            mt: 1, // Margin top to separate from the first sheet if needed
            display: 'flex',
            justifyContent: 'space-between',
            width: 'auto',
            p: 2,
            bgcolor: 'background.body',
            textAlign: 'center'
          }}
        >
          <Button variant="outlined" color="primary" onClick={() => handelSetProgress(true)}>
            Back
          </Button>
          {status !== '' && (
            <Typography level="body-md" sx={{ textAlign: 'center' }}>
              {status}
            </Typography>
          )}
          <Button variant="outlined" color="primary" onClick={() => handelSetProgress(false)}>
            Save
          </Button>
        </Sheet>
      </Sheet>
    </>
  )
}
