import * as React from 'react'
import { Sheet, Typography, Button } from '@mui/joy'
import { menuHook } from '../../../hooks/menuHook'
import { seedPhraseToEntropy } from '../../../lib/buildooor'
import { Input } from '@mui/joy'

interface VerifySeedPhraseProps {
  entropy: string
  verified: boolean
  setVerified: (verified: boolean) => void
  status: string
  setStatus: (status: string) => void
  handelSetProgress: (back: boolean) => void
  saveWalletData: () => void
}

export const VerifySeedPhrase: React.FC<VerifySeedPhraseProps> = ({
  entropy,
  verified,
  setVerified,
  status,
  setStatus,
  handelSetProgress,
  saveWalletData
}) => {
  const [words, setWords] = React.useState<string[]>(Array(24).fill(''))
  const [menu, setMenu] = menuHook()

  const handleChange = (index: number, value: string) => {
    const newWords = [...words]
    newWords[index] = value
    setWords(newWords)
  }

  const handleVerify = () => {
    const entropyVerify = seedPhraseToEntropy(words.join(' '))
    // console.log("entropy", entropy);
    entropy === entropyVerify
      ? setStatus('Seed Phrase Verified, New wallet setup is complete')
      : setStatus('Seed Phrase does not match')
    entropy === entropyVerify ? setVerified(true) : setVerified(false)
    entropy === entropyVerify && saveWalletData() 
    return void 0
  }

  React.useEffect(() => {
    setStatus('')
  }, [])

  return (
    <>
      <Sheet sx={{ p: 2 }}>
        <Typography level="h1" sx={{ textAlign: 'center' }}>
          Please verify your seed phrase.
        </Typography>
        <br />
        <hr />
        <br />
        <Typography level="body-md" sx={{ textAlign: 'left' }}>
          Since this is a newly generated account, we need to make sure you have written down your
          seed phrase properly.
        </Typography>
        {words.length > 1 && (
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
            {words.map((_, index: number) => (
              <Input
                key={index}
                value={words[index]}
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
        <Button variant="outlined" color="primary" onClick={() => handelSetProgress( true )}>
          Back
        </Button>
        {status !== '' && (
          <Typography level="body-md" sx={{ textAlign: 'center' }}>
            {status}
          </Typography>
        )}
        {verified === true && (
          <Button variant="outlined" color="primary" onClick={() => setMenu('WalletView')}>
            Continue
          </Button>
        )}
      </Sheet>
    </>
  )
}
