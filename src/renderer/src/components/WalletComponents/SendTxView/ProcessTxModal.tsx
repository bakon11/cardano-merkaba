import * as React from 'react'
import { Modal, ModalClose, ModalDialog, Typography, Sheet, Button, Input, Stack } from '@mui/joy'
import { genRootPrivateKey, genAddressPrv, decrypt } from '../../../lib/cryptoPLUTS'

interface ProcessTxModalProps {
  processTx: ( address_xprv ) => void
  accountInfo: any
}

export const ProcessTxModal: React.FC<ProcessTxModalProps> = ({ processTx, accountInfo }) => {
  const [open, setOpen] = React.useState<boolean>(false)

  const signTx = async () => {
    console.log('accountInfo', accountInfo)
    const getWalletEntropy = (walletId: string): any => window.api.getWalletEntropy(walletId)
    const walletEntropy = await getWalletEntropy(accountInfo.account.walletId)
    console.log('walletEntropy', walletEntropy.entropyEncrypt)
    const entropyDecrypted = decrypt(walletEntropy.entropyEncrypt, 'baca1983')
    console.log('entropyDecrypted', entropyDecrypted)
    const root_xprv: any = genRootPrivateKey(entropyDecrypted)
    console.log('root_xprv', root_xprv)
    // const account_xprv = genAccountPrivatekey(root_xprv, accountInfo.account.accountIndex)
    // console.log('account_xprv', account_xprv)
    const address_xprv = genAddressPrv(
      root_xprv,
      accountInfo.account.accountIndex,
      0,
      accountInfo.account.addressIndex
    )
    // const address_xprv = genAddressPrivateKey(account_xprv, accountInfo.account.addressIndex)
    console.log('address_xprv', address_xprv)
    const txProcessed: any = await processTx( address_xprv )
    const txCBOR = txProcessed.toCbor().toString()
    console.log('txCBOR', txCBOR)
    console.log('txProcessed', txProcessed)
  }

  return (
    <>
      <Button sx={{ m: 2, cursor: 'pointer' }} onClick={() => setOpen(true)}>
        Process TX
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <ModalDialog
          sx={{
            width: '1200px',
            maxWidth: '100%',
            maxHeight: '800px',
            overflowY: 'auto',
            p: 4,
            bgcolor: 'background.body',
            color: 'text.primary'
          }}
        >
          <ModalClose />
          <Typography level="h4">Transaction Details</Typography>
          <Sheet
            sx={{
              height: 'auto',
              p: 2
            }}
          >
            <Stack spacing={2} direction="column">
              {/* Transaction ID */}
              <Input startDecorator="ID:" value="DummyTransactionID123" disabled />

              {/* Transaction Size */}
              <Input startDecorator="Size:" value="1000 bytes" disabled />

              {/* Transaction Fee */}
              <Input startDecorator="Fee:" value="0.001 BTC" disabled />

              {/* UTXO Input */}
              <Input startDecorator="Input:" value="1 BTC from Address ABC" disabled />

              {/* UTXO Output */}
              <Input startDecorator="Output:" value="0.999 BTC to Address XYZ" disabled />

              <Button onClick={signTx} sx={{ mt: 2 }}>
                Process Tx
              </Button>
            </Stack>
          </Sheet>
        </ModalDialog>
      </Modal>
    </>
  )
}