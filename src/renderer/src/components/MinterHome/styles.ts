// Custom styles for a modern, professional look with overflow management
export const professionalStyle = {
  fontFamily: "'Roboto', sans-serif",
  color: '#E0E0E0', // Light grey text for readability on dark backgrounds
  backgroundColor: '#121212', // Deep dark background
  borderRadius: '8px', // Rounded corners for modern look
  padding: '15px',
  margin: '10px 0',
  boxShadow: '0 4px 8px rgba(0,0,0,0.3)', // Shadow for depth
  overflowWrap: 'break-word', // Wrap long strings
  wordBreak: 'break-word', // Break very long words
  maxWidth: '100%' // Ensure text does not exceed container
}

export const accentStyle = {
  ...professionalStyle,
  backgroundColor: '#FFCA28', // Bright yellow for highlights
  color: '#121212' // Dark text on bright background
}

export const sectionTitleStyle = {
  ...professionalStyle,
  fontSize: '1.2em',
  fontWeight: 'bold',
  borderBottom: '1px solid #E0E0E0',
  paddingBottom: '5px',
  marginBottom: '10px',
  color: '#E0E0E0'
  // No need for overflow management here since titles should be short
}

// Custom styles for a modern, professional look with overflow management
export const displayAssets = {
  fontFamily: "'Roboto', sans-serif",
  color: '#E0E0E0', // Light grey text for readability on dark backgrounds
  backgroundColor: '#121212', // Deep dark background
  borderRadius: '8px', // Rounded corners for modern look
  padding: '10px',
  margin: '0 0',
  boxShadow: '0 4px 8px rgba(0,0,0,0.3)', // Shadow for depth
  overflowWrap: 'break-word', // Wrap long strings
  wordBreak: 'break-word', // Break very long words
  maxWidth: '100%', // Ensure text does not exceed container
  textAlign: 'right'
}