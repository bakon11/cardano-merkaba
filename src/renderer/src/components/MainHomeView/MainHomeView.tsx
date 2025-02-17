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
        Welcome to the Merkaba
      </Typography>
      <Typography
        sx={{
          mb: 4,
          textAlign: 'center',
          fontWeight: 'light'
        }}
      >
        (Currenlty the Merkaba uses Testnet by default, switch to mainnet at your own risk.)
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
        The Cardano Merkaba is built using the{' '}
        <a href="https://github.com/HarmonicLabs/buildooor"  style={{color: "white", fontWeight: "bolder", fontSize: "1.2em"}}> 
          buildooor
          <img
            src="https://github.com/HarmonicLabs/buildooor/blob/main/assets/buildooor.png?raw=true"
            height="75"
            alt="buildooor logo"
          />
        </a>{' '}
        library from Harmonic Labs. It's designed to run as a standalone, trustless application on
        your own Cardano infrastructure. The main requirement for node setup is Ogmios connected to
        a Cardano Node.
      </Typography>
      <br />
      <Typography>
        In the near future, Node options like Harmonic Labs' Gerolamo (a TypeScript node with
        browser support) will be available to run locally as well.
      </Typography>
      <Typography level="body-md" sx={{ mt: 2, fontWeight: 'bold' }}>
        What does that mean?
      </Typography>
      <Typography>
        It means you're in control of your data and keys. The wallet acts as a front-end that
        connects to your own Cardano Node or Indexer, ensuring your data is secure and private. If
        you've used Daedalus, this setup is quite similar.
      </Typography>
      <br />
      <Typography>
        However, unlike Daedalus, which requires running the node on the same machine as the wallet,
        Cardano Merkaba offers more flexibility. If you're using a laptop with limited specs or
        running demanding tasks, you won't need to stop syncing your wallet every time. With
        Merkaba, your node can run on a different machine or server, avoiding the resource-intensive
        process of catching up after each restart.
      </Typography>

      <Typography>
        Additionally, other hosted cloud solutions like{' '}
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
        info like your address's UTXOs might take a bit longer depending on the system your Node is
        running on compared to querying against an indexer like KUPO. However, because we use
        <a href="https://github.com/HarmonicLabs/buildooor"  style={{color: "white", fontWeight: "bolder", fontSize: "1.2em"}}> 
          buildooor
          <img
            src="https://github.com/HarmonicLabs/buildooor/blob/main/assets/buildooor.png?raw=true"
            height="75"
            alt="buildooor logo"
          />
        </a>{' '}<br />
        all transactions (e.g., ADA and assets, pool delegation, governance transactions) are
        generated off-chain in the user space securley.
      </Typography>
      <Typography>
        If you want to view metadata information about your assets, you'll need to run the Metadata
        Indexer.
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
        points as well. And if you have a little bit of Linux knowledge and aren't intimidate by
        using terminal, there is a small tool I careated called Noderunner that will help you run
        each of the above software mentioned. https://github.com/bakon11/noderunner
      </Typography>
      <Typography level="body-md" sx={{ mt: 2 }}>
        - Getting Started: Click here for setup instructions.
      </Typography>
      <Typography level="body-md">- Support: Contact us for assistance.</Typography>
      <Typography level="body-md">- Features: Explore what's new.</Typography>
    </Sheet>
  )
}
