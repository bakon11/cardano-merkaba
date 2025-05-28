import { Sheet, Typography, Button } from '@mui/joy/'
import { menuHook } from '../../hooks/menuHook'
import { useNavigate } from 'react-router-dom'

export const SideBar = (): JSX.Element => {
  const [menu, setMenu] = menuHook()
  const navigate = useNavigate()

  const handleNavigate = (path) => {
    navigate(path)
  }

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '40px',
    padding: 0,
    fontSize: '14px',
    fontWeight: 'bold',
    border: '2px solid #00ff00', // Neon green border
    borderRadius: '0', // Flat edges for a retro look
    background: 'linear-gradient(135deg, #000000, #333333)', // Dark gradient background
    boxShadow: '0 0 5px #00ff00, 0 0 20px #00ff00, 0 0 1px #00ff00', // Neon glow effect
    color: '#00ff00', // Text color in neon green
    fontFamily: 'monospace', // Retro coding font
    textTransform: 'uppercase', // All caps for intensity
    letterSpacing: '1px', // Spacing for that digital look
    '&:hover': {
      background: 'linear-gradient(135deg, #1a1a1a, #4d4d4d)', // Slightly lighter on hover
      boxShadow: '0 0 5px #00ff00, 0 0 25px #00ff00, 0 0 1px #00ff00' // More intense glow
    },
    '&:active': {
      background: 'linear-gradient(135deg, #262626, #666666)', // Even lighter when pressed
      boxShadow: 'inset 0 0 5px #00ff00, inset 0 0 1px #00ff00' // Inset glow for pressed effect
    }
  }

  return (
    <>
      {/* Fixed Sidebar at the edge of screen */}
      <Sheet
        sx={{
          position: 'fixed',
          top: '55px', // Adjust based on the height of your top bar
          left: 0,
          width: '150px', // Narrower for a menu bar look
          height: 'calc(100vh - 60px)', // Full height minus top bar
          borderRight: '1px solid',
          borderColor: 'divider',
          overflow: 'auto',
          zIndex: 999, // Below the top bar but above other content
          backgroundColor: 'background.body'
        }}
      >
        <Typography
          level="h4"
          sx={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            padding: '1rem 0',
            fontSize: '0.75rem',
            textAlign: 'center'
          }}
        >
          Menu
        </Typography>
        {/* Place your menu items here. Example: */}
        <Button
          variant="outlined"
          color="primary"
          sx={buttonStyle}
          onClick={() => {
            setMenu('ViewWallets')
            handleNavigate('/wallet')
          }}
        >
          Wallets
        </Button>
        <br />
        <Button
          variant="outlined"
          color="primary"
          sx={buttonStyle}
          onClick={() => {
            setMenu('StakingPools')
            handleNavigate('/StakingPools')
          }}
        >
          Stake Pools
        </Button>
        <br />
        <Button
          variant="plain"
          color="primary"
          sx={buttonStyle}
          onClick={() => {
            setMenu('MinterHome')
            handleNavigate('/minter')
          }}
        >
          Minter
        </Button>
        <br />
        <Button
          variant="plain"
          color="primary"
          sx={buttonStyle}
          onClick={() => {
            setMenu('MainHomeView')
            handleNavigate('/')
          }}
        >
          Home
        </Button>
        <br />
        <Button
          variant="plain"
          color="primary"
          sx={buttonStyle}
          onClick={() => {
            setMenu('AiAgentMain')
            handleNavigate('/AiAgentMain')
          }}
        >
          Merkaba Sentient
        </Button>
        <br />
        <Button
          variant="plain"
          color="primary"
          sx={buttonStyle}        
          onClick={() => {
            setMenu('GravityMain')
            handleNavigate('/gravity')
          }}
        >
          Gravity
        </Button>
        <br />
        <Button
          variant="plain"
          color="primary"
          sx={buttonStyle}
          onClick={() => {
            setMenu('CborTools')
            handleNavigate('/Cbor_tools')
          }}
        >
          Cbor Tools
        </Button>
        {/* Add more menu items as needed */}
      </Sheet>
    </>
  )
}
