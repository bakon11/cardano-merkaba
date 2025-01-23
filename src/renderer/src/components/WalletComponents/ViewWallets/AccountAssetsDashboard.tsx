import * as React from 'react'
import { List, ListItem, ListItemButton, Sheet, Typography, Button, Input } from '@mui/joy'
import { toUtf8, fromHex } from '@harmoniclabs/uint8array-utils'

interface Asset {
  policyId: string
  tokenName: string
  amount: number
  tokenNameDecoded: string
}

interface AccountAssetsDashboardProps {
  assets: { lovelace: number; assets: { [key: string]: { [key: string]: number } } }
}

export const AccountAssetsDashboard: React.FC<AccountAssetsDashboardProps> = ({ assets }) => {
  const [searchTerm, setSearchTerm] = React.useState<string>('')
  const [filteredAssets, setFilteredAssets] = React.useState<{ [key: string]: Asset[] }>({})

  // Filter and group assets by Policy ID
  const filterAssets = (term: string): { [key: string]: Asset[] } => {
    const flatAssets: Asset[] = Object.entries(assets.assets).flatMap(([policyId, tokens]) =>
      Object.entries(tokens).map(([tokenName, amount]) => ({
        policyId,
        tokenName,
        amount: amount as number,
        tokenNameDecoded: toUtf8(fromHex(tokenName))
      }
    
    ))
      
    )

    if (term === '') {
      // If the search term is empty, return all assets
      return flatAssets.reduce(
        (acc, asset) => {
          if (!acc[asset.policyId]) {
            acc[asset.policyId] = []
          }
          acc[asset.policyId].push(asset)
          return acc
        },
        {} as { [key: string]: Asset[] }
      )
    } else {
      // Filter assets based on search term
      return flatAssets.reduce(
        (acc, asset) => {
          if (
            !acc[asset.policyId] &&
            (asset.policyId.toLowerCase().includes(term.toLowerCase()) ||
              asset.tokenNameDecoded.toLowerCase().includes(term.toLowerCase()))
          ) {
            acc[asset.policyId] = []
          }
          if (
            acc[asset.policyId] &&
            asset.tokenNameDecoded.toLowerCase().includes(term.toLowerCase())
          ) {
            acc[asset.policyId].push(asset)
          }
          return acc
        },
        {} as { [key: string]: Asset[] }
      )
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value
    setSearchTerm(term)
    setFilteredAssets(filterAssets(term))
  }

  React.useEffect(() => {
    // Initial load with all assets
    setFilteredAssets(filterAssets(''))
  }, [assets]) // This effect runs when 'assets' prop changes

  return (
    <Sheet sx={{ width: '100%', bgcolor: 'background.level1', borderRadius: 'sm', p: 2 }}>
      <Typography level="h3" sx={{ mb: 2 }}>
        Your Assets
      </Typography>

      <Input
        placeholder="Search by Policy ID or Token Name"
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ mb: 2 }}
      />

      <List>
        {Object.entries(filteredAssets).map(([policyId, tokens]) => (
          <React.Fragment key={policyId}>
            <Typography level="h5" sx={{ mt: 2 }}>
              Poliocy ID: {policyId}
            </Typography>
            {tokens.map((asset, index) => (
              <ListItem key={index} sx={{ p: 0 }}>
                <ListItemButton
                  component="div"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 'sm',
                    p: 1,
                    mb: 1,
                    width: '100%'
                  }}
                  onClick={() => console.log('View metadata for:', asset.tokenNameDecoded)}
                >
                  {/* Placeholder for asset image */}
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      backgroundColor: '#e0e0e0',
                      marginRight: '10px'
                    }}
                  ></div>
                  <div>
                    <Typography level="body-md">{asset.tokenNameDecoded}</Typography>
                    <Typography level="body-md">{`Amount: ${asset.amount}`}</Typography>
                  </div>
                  <Button
                    size="sm"
                    variant="outlined"
                    sx={{ ml: 'auto' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log('More info for:', asset.tokenNameDecoded)
                    }}
                  >
                    More Info
                  </Button>
                </ListItemButton>
              </ListItem>
            ))}
          </React.Fragment>
        ))}
        {Object.keys(filteredAssets).length === 0 && (
          <ListItem>
            <Typography>No assets match your search.</Typography>
          </ListItem>
        )}
      </List>
    </Sheet>
  )
}
