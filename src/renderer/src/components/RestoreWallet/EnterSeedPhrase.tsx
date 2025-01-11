import * as React from 'react'
import { Sheet, Typography, Button } from '@mui/joy'
import { menuHook } from '../../hooks/menuHook'
import { Input } from '@mui/joy'
import { validateSeedPhrase } from '../../lib/cryptoPLUTS'

interface EnterSeedPhraseProps {
  seedPhrase: string[]
  setSeedPhrase: (seedPhrase: string[]) => void
  status: string
  setStatus: (status: string) => void
  handelSetProgress: (back: boolean) => void
  createWallet: () => void
}

export const EnterSeedPhrase: React.FC<EnterSeedPhraseProps> = ({
  seedPhrase,
  setSeedPhrase,
  status,
  setStatus,
  handelSetProgress,
  createWallet
}) => {
  const [menu, setMenu] = menuHook()
  const [verified, setVerified] = React.useState<boolean>(false)
  const handleChange = (index: number, value: string) => {
    const newWords: string[] = [...seedPhrase]
    newWords[index] = value
    setSeedPhrase(newWords)
  }

  const handleVerify = () => {
    const validateSeedPhraseResult: boolean | any = validateSeedPhrase(seedPhrase.join(' '))
    console.log('seedPhrase', seedPhrase.join(' '))
    console.log('validateSeedPhraseResult', validateSeedPhraseResult)
    validateSeedPhraseResult
      ? setStatus('Seed Phrase Verified')
      : setStatus('Seed Phrase is invalid')
    validateSeedPhraseResult && createWallet()
    setVerified(validateSeedPhraseResult)
  }

  React.useEffect(() => {
    setStatus('')
  }, [])

  return (
    <>
      <Sheet sx={{ p: 2 }}>
        <Typography level="h1" sx={{ textAlign: 'center' }}>
          Please Enter your seed phrase.
        </Typography>
        <br />
        <hr />
        <br />
        <Typography level="body-md" sx={{ textAlign: 'left' }}>
          Restoring a wallet from seed phrase is a sensitive operation. Make sure you are in a
          private and secure enviroment.
        </Typography>
        {seedPhrase.length > 1 && (
          <Sheet
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)', // 4 columns for 6 rows
              gap: 1, // gap between squares
              justifyContent: 'center',
              alignContent: 'center',
              p: 2
            }}
          >
            {seedPhrase.map((_, index: number) => (
              <Input
                key={index}
                value={seedPhrase[index]}
                onChange={(e) => handleChange(index, e.target.value)}
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
              />
            ))}
          </Sheet>
        )}
        <Sheet sx={{ textAlign: 'center' }}>
          <Button variant="outlined" color="primary" onClick={() => handleVerify()}>
            Verify Seed Phrase
          </Button>
        </Sheet>
      </Sheet>
      <Sheet
        sx={{
          mt: 1, // Margin top to separate from the first sheet if needed
          display: 'flex',
          justifyContent: 'space-between',
          width: 'auto',
          p: 2,
          bgcolor: 'background.body'
        }}
      >
        {status !== '' && (
          <Typography level="body-md" sx={{ textAlign: 'center' }}>
            {status}
          </Typography>
        )}

        {verified && (
          <Button variant="outlined" color="primary" onClick={() => handelSetProgress(false)}>
            Continue
          </Button>
        )}
      </Sheet>
    </>
  )
}
