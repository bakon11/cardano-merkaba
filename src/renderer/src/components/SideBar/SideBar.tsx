import { Sheet, Typography, Button } from '@mui/joy/'
import { menuHook } from '../../hooks/menuHook'

export const SideBar = (): JSX.Element => {
  const [menu, setMenu] = menuHook()

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '50px',
    padding: 0,
    fontSize: '12px',
    fontWeight: 'bold',
    borderColor: 'primary.500',
    borderWidth: '2px',
    borderRadius: '10px',
    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
    boxShadow: '0 0 8px rgba(255, 107, 107, 0.5), 0 0 12px rgba(78, 205, 196, 0.5)',
    '&:hover': {
      background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
      boxShadow: '0 0 12px rgba(255, 107, 107, 0.7), 0 0 16px rgba(78, 205, 196, 0.7)'
    },
    '&:active': {
      background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
      boxShadow: 'inset 0 0 12px rgba(255, 107, 107, 0.5), inset 0 0 12px rgba(78, 205, 196, 0.5)'
    },
    // Apply the custom font to the button text
    fontFamily: 'var(--joy-fontFamily-button)',
    textTransform: 'uppercase', // Optional, for a more dynamic look
    letterSpacing: '1px' // Optional, adds some coolness to the text
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
          onClick={() => setMenu('WalletView')}
        >
          Wallet
        </Button>
        <br />
        <Button variant="plain" color="primary" sx={buttonStyle}>
          Minter
        </Button>
        <br />
        <Button
          variant="plain"
          color="primary"
          sx={buttonStyle}
          onClick={() => setMenu('MainHomeView')}
        >
          Home
        </Button>
        {/* Add more menu items as needed */}
      </Sheet>
    </>
  )
}
