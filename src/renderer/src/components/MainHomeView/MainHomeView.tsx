import * as React from 'react'
import { CssVarsProvider } from '@mui/joy/styles'
import Sheet from '@mui/joy/Sheet'
import { Card, Typography, List, ListItem } from '@mui/joy'

export const MainHomeView: React.FC = () => {
  return (
    <Sheet
      sx={{
        top: 60,
        left: 60,
        width: 1200,
        height: 900,
        overflowY: 'auto',
        p: 4,
        bgcolor: 'background.body',
        color: 'text.primary'
      }}
    >
      {/* Welcome Message */}
      <Typography
        level="h1"
        sx={{
          mb: 0,
          textAlign: 'center',
          fontWeight: 'light'
        }}
      >
        Welcome to the Merkaba Wallet
      </Typography>
      <Typography
        sx={{
          mb: 4,
          textAlign: 'center',
          fontWeight: 'light'
        }}
      >
        (Currenlty the wallet is only supports preprod network.)
      </Typography>
      {/* Latest Updates */}
      <Typography level="h2" mb={3} textAlign="center">
        Planed Features
      </Typography>
      <Card sx={{ mb: 4, border: 'none', p: 0 }}>
        <ul>
          <li>
            <Typography level="body1" mb={2}>
              Full Policy creator and minter for assets
            </Typography>
          </li>
          <li>
          <Typography level="body1" mb={2}>
            Stake Pool view and management
          </Typography>
          </li>
          <li>
          <Typography level="body1" mb={2}>
            Governance: Ability to view Proposals and Actions, DRep explorer, voting and delegating
          </Typography>
          </li>
          {/* Add more updates here */}
        </ul>
      </Card>

      {/* Information Section */}
      <Typography level="h2" mb={3} textAlign="center">
        Info
      </Typography>
      <Typography>
        The merkaba wallet is build using the PLU-TS Library and is create to run as a stand alone
        applicaiton in a trustless manner on your own Cardano infrastructure Currenlty the wallet is
        only supporting preprod network.
      </Typography>
      <Typography level="body2" sx={{ mt: 2, fontWeight: 'bold' }}>
        What does that mean?
      </Typography>
      <Typography>
        The wallet is a standalone application that runs on your own Cardano infrastructure if you
        so choose to.
        <br />
        Currently the wallet requires:
        <List
          sx={{
            width: 500,
            mt: 2
          }}
        >
          <ListItem>
            <Typography>
              <a
                href="https://github.com/cardanosolutions/ogmios"
                target="_blank"
                rel="noopener noreferrer"
              >
                Cardano Node with Ogmios
              </a>
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              <a
                href="https://github.com/cardanosolutions/kupo"
                target="_blank"
                rel="noopener noreferrer"
              >
                Kupo Indexer(For UTXOS)
              </a>
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              <a
                href="https://github.com/bakon11/cardano_metadata_indexer"
                target="_blank"
                rel="noopener noreferrer"
              >
                Metadata Indexer(Optional)
              </a>
            </Typography>
          </ListItem>
        </List>
        If you don't have any of those services running it's not a big deal we do provide public end
        points as well. And if you have a little bit of Linux knowldege and aren't intimidate by
        terminal, there is a small tool I careated called Noderunner that will help you run each of
        the above software mentioned. https://github.com/bakon11/noderunner
      </Typography>
      <Typography level="body2" sx={{ mt: 2 }}>
        - Getting Started: Click here for setup instructions.
      </Typography>
      <Typography level="body2">- Support: Contact us for assistance.</Typography>
      <Typography level="body2">- Features: Explore what's new.</Typography>
    </Sheet>
  )
}
