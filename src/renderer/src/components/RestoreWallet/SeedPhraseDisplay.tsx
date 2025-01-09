import * as React from 'react'
import { Sheet, Typography, Button } from '@mui/joy'


interface SeedPhraseDisplayProps {
  seedPhrase: string | any
  createNewWallet: () => void
  handelSetProgress: ( back: boolean ) => void
}

export const SeedPhraseDisplay: React.FC<SeedPhraseDisplayProps> = ({
  seedPhrase,
  createNewWallet,
  handelSetProgress
}) => {
  const words = seedPhrase.split(' ')

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
        <Typography level="body-md" sx={{ textAlign: 'left' }}>
          Again, before you generate your Seed phrase make sure you are the only one seeing it and
          are in a private space, where no one can peek over your shoulder.
        </Typography>
        <br />
        <Typography level="body-md" sx={{ textAlign: 'left' }}>
          Make sure you keep the seed phrase only where you can access it. Probably a bad idea to
          store it electronically or using something like a password manager.
        </Typography>
        <br />
        <Sheet>
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
            mt: 1, // Margin top to separate from the first sheet if needed
            display: 'flex',
            justifyContent: 'space-between',
            width: 'auto',
            p: 2,
            bgcolor: 'background.body',
            textAlign: 'center'
          }}
        >
          {seedPhrase !== '' && (
            <Button variant="outlined" color="primary" onClick={() => handelSetProgress( false )}>
              Continue
            </Button>
          )}
        </Sheet>
      </Sheet>
    </>
  )
}
