import React from 'react'
import { Sheet, Typography, IconButton, Table } from '@mui/joy'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

interface Account {
  walletId: string
  walletName: string
  accountName: string
  accountIndex: number
  addressIndex: number
  baseAddress_bech32: string
  stakeAddress_bech32: string
}

interface WalletAccountsProps {
  accounts: Account[]
}

const Row = (props: { row: Account; initialOpen?: boolean }) => {
  const { row } = props
  const [open, setOpen] = React.useState(props.initialOpen || false)

  return (
    <React.Fragment>
      <tr>
        <td>
          <IconButton
            aria-label="expand row"
            variant="plain"
            color="neutral"
            size="sm"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </td>
        <th scope="row">{row.walletName}</th>
        <td>
          <Typography
            noWrap
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '600px' }}
          >
            {row.walletId}
          </Typography>
        </td>
      </tr>
      <tr>
        <td style={{ height: 0, padding: 0 }} colSpan={3}>
          {open && (
            <Sheet
              variant="soft"
              sx={{ p: 1, pl: 6, boxShadow: 'inset 0 3px 6px 0 rgba(0 0 0 / 0.08)' }}
            >
              <Typography level="body-lg" component="div">
                Accounts (Click account to view)
              </Typography>
              <Table
                borderAxis="bothBetween"
                size="sm"
                aria-label="accounts"
                sx={{
                  '& > thead > tr > th:nth-child(n + 2), & > tbody > tr > td:nth-child(n + 2)': {
                    textAlign: 'left'
                  },
                  '--TableCell-paddingX': '0.5rem'
                }}
              >
                <thead>
                  <tr>
                    <th>Account Name</th>
                    <th >Account Index</th>
                    <th>Base Address</th>
                    <th>Stake Address</th>
                  </tr>
                </thead>
                <tbody>
                  {props.row.accounts.map((account) => (
                    <tr key={account.accountIndex} onClick={() => alert(JSON.stringify(account))} style={{ cursor: 'pointer' }} >
                      <th scope="row">{account.accountName}</th>
                      <td >{account.accountIndex}</td>
                      <td>
                        <Typography
                          noWrap
                          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}
                        >
                          {account.baseAddress_bech32}
                        </Typography>
                      </td>
                      <td>
                        <Typography
                          noWrap
                          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}
                        >
                          {account.stakeAddress_bech32}
                        </Typography>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Sheet>
          )}
        </td>
      </tr>
    </React.Fragment>
  )
}

export const WalletSelectionTable = ({ accounts }: WalletAccountsProps) => {
  // Group accounts by walletId
  const groupedAccounts = accounts.reduce(
    (acc, account) => {
      if (!acc[account.walletId]) {
        acc[account.walletId] = {
          walletName: account.walletName,
          walletId: account.walletId,
          accounts: []
        }
      }
      acc[account.walletId].accounts.push(account)
      return acc
    },
    {} as Record<string, { walletName: string; walletId: string; accounts: Account[] }>
  )

  return (
    <Sheet>
      <Table
        aria-label="collapsible table"
        sx={{
          '& > thead > tr > th:nth-child(n + 2)': { textAlign: 'left' },
          '& > tbody > tr:nth-child(odd) > td, & > tbody > tr:nth-child(odd) > th[scope="row"]': {
            borderBottom: 0
          }
        }}
      >
        <thead>
          <tr>
            <th style={{ width: 40 }} aria-label="empty" />
            <th style={{ width: '40%' }}>Wallet Name</th>
            <th>Wallet ID</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(groupedAccounts).map((wallet, index) => (
            <Row key={wallet.walletId} row={wallet} initialOpen={index === 0} />
          ))}
        </tbody>
      </Table>
    </Sheet>
  )
}
