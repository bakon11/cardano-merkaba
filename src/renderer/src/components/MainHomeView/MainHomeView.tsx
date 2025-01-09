import * as React from 'react'
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
        (Currenlty the wallet uses Testnet by default, switch to mainnet at your own risk.)
      </Typography>
      <hr />
      <br />
      {/* Latest Updates */}
      {/*
      <Typography level="h2" mb={3} textAlign="center">
        Planed Features
      </Typography>
      <Card sx={{ mb: 4, border: 'none', p: 0 }}>
        <ul>
          <li>
            <Typography level="body-md" mb={2}>
              Full Policy creator and minter for assets
            </Typography>
          </li>
          <li>
            <Typography level="body-md" mb={2}>
              Stake Pool view and management
            </Typography>
          </li>
          <li>
            <Typography level="body-md" mb={2}>
              Governance: Ability to view Proposals and Actions, DRep explorer, voting and
              delegating
            </Typography>
          </li>
        </ul>
      </Card>
      */}
      {/* Information Section */}
      <Typography level="h2" mb={3} textAlign="center">
        Info
      </Typography>
      <Typography>
        The Cardano Merkaba is build using the PLU-TS Library and is create to run as a stand alone
        applicaiton in a trustless manner on your own Cardano infrastructure.
      </Typography>
      <Typography level="body-md" sx={{ mt: 2, fontWeight: 'bold' }}>
        What does that mean?
      </Typography>
      <Typography>
        It means that you are in control of your own data and your own keys. The wallet is a
        front-end that connects to your own Cardano Node and or Indexer. This way you can be sure
        that your data is secure and private. If you're familiar with the Daedalus wallet, this is very similar.
      </Typography>
      <Typography>
        However Daedalus forces you to run the node on the same Machine it is running on. Which means that if it's on your laptop you travel with often,
        or your machine isn't of the greatest specs or even if it is but you're running a damanding task on it, you have to stop the wallet which stops the node syncing.
        And next time you tunr it on you have to wait till it catches up which is a bit reosurce demnading in itself.
      </Typography>
      
      <Typography>
        however other hosted cloud solutions like{' '}
        <a href="https://demeter.run/" target="_blank" rel="noopener noreferrer">
          Demeter.run
        </a>{' '}
        are supported as well.
      </Typography>
      <br />
      <hr />
      <br />
      <Typography level="h2" mb={3} textAlign="center">
        How to get started
      </Typography>
      <Typography>
        The bare minimum you need to run Cardano Merkaba is a Cardano Node with Ogmios. Querying
        info like your Address UTXO's takes a fraction longer dependaing on the system your Node is
        running on VS if you queried against a indexer like KUPO. However because of using PLU-TS,
        all transactions are generated off chain e.g.: Ada and assets, Pool delegation
        transacations, governance transactions, etc.
      </Typography>
      <Typography>
        If you want to view metadata information about your assets, you will need to run the Metadata Indexer.
      </Typography>
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
              Kupo Indexer(Optional)
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
      <Typography>
        If you don't have any of those services running it's not a big deal we do provide public end
        points as well. And if you have a little bit of Linux knowledge and aren't intimidate by using
        terminal, there is a small tool I careated called Noderunner that will help you run each of
        the above software mentioned. https://github.com/bakon11/noderunner
      </Typography>
      <Typography level="body-md" sx={{ mt: 2 }}>
        - Getting Started: Click here for setup instructions.
      </Typography>
      <Typography level="body-md">- Support: Contact us for assistance.</Typography>
      <Typography level="body-md">- Features: Explore what's new.</Typography>
    </Sheet>
  )
}
