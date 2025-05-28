import * as React from 'react'
import { Select, Option } from '@mui/joy'
import { getAccountUtxoInfoOgmios, parseOgmiosUtxosForWallet } from '../../API/ogmios'
import { selectedAccountHook } from '../../hooks/selectedAccountHook';
import { backendHook } from '../../hooks/backendHook';

export const SelectAccount: React.FC = () => {

    const getAllWallets = (): any => window.api.getAllWallets();
    const [backEnd, setBackEnd]: [string | null, (config: string) => Promise<void>] = backendHook();
    const [selectedWalletId, setSelectedWalletId] = React.useState<string | null>(null);
    const [allWallets, setAllWallets] = React.useState<any>([]);
    const [selectedAccount, setSelectedAccount] = selectedAccountHook() as any

    const getWalletAccounts = async () => {
        const data = await getAllWallets()
        console.log('data', data)
        setAllWallets(data)
    }
    const fetchAccountAddressUtxos = async (selectedAccount: any) => {
        console.log('selectedAccount', selectedAccount)
        const backend = JSON.parse(backEnd as any)
        if (backend && backend[0] === 'ogmios') {
        const data: any = await getAccountUtxoInfoOgmios([selectedAccount.baseAddress_bech32])
        const parssedAssets = parseOgmiosUtxosForWallet(data)
        const everything = { account: selectedAccount, value: parssedAssets, utxos: data }
        console.log('everything', everything)
        setSelectedAccount(everything)
        }
    }

    React.useEffect(() => {
        if (selectedWalletId === null) {
            getWalletAccounts()  
        const selectedWallet = allWallets.find((wallet) => wallet.walletId === selectedWalletId)
        console.log('selectedWallet', selectedWallet)
        if (selectedWallet) {
            setSelectedAccount(selectedWallet)
            fetchAccountAddressUtxos(selectedWallet)
        }
        }
    }, [selectedWalletId])


    return (
        <Select
        placeholder="Select a wallet"
        value={selectedWalletId}
        onChange={(event, newValue) => {
            setSelectedWalletId(newValue)
        }}
        >
        {allWallets.map((wallet) => (
            <Option key={wallet.walletId} value={wallet.walletId}>
            {wallet.walletName} - {wallet.accountName}
            </Option>
        ))}
        </Select>
    )
}