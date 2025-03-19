import * as React from 'react'
import { Sheet, Input, Typography, Button } from '@mui/joy'
import { useAIEndpoint } from '../../hooks/ollamaEndPointHook'

export const SetOllamaHost: React.FC = () => {
  const [hostAddress, setHostAddress] = React.useState('')
  const [portNumber, setPortNumber] = React.useState('')
  const [aiEndpoint, setAIendpoint]: any = useAIEndpoint()

  const handleSetAIEndPoint = async () => {
    // Validate input
    if (!hostAddress || !portNumber) {
      alert('Please enter both IP address and port number.');
      return;
    }
    if (isNaN(Number(portNumber))) {
      alert('Port number must be a number.');
      return;
    }

    const endpointArray = [hostAddress, portNumber];
    const endpointArrayString = JSON.stringify(endpointArray);
    console.log("endpointArrayString: ", endpointArrayString);
    setAIendpoint(endpointArrayString);
    
  };

  React.useEffect(() => {
    !aiEndpoint ? setHostAddress('localhost') :  setHostAddress(JSON.parse(aiEndpoint)[0])
    !aiEndpoint ? setPortNumber('11434') :  setPortNumber(JSON.parse(aiEndpoint)[1])

  }, [aiEndpoint]);

  return (
    <Sheet
        variant="outlined"
        sx={{
        maxWidth: 500,
        borderRadius: 'md',
        p: 3,
        boxShadow: 'lg'
        }}
    >
        <Typography
        component="h2"
        id="modal-title"
        level="h4"
        textColor="inherit"
        sx={{ fontWeight: 'lg', mb: 1 }}
        >
        Node Configuration
        </Typography>
    
        <Sheet sx={{ p: 2 }}>
            <Typography level="body-md" id="modal-description">Enter endpoints for your Ollama instance.</Typography>
            <Input
            sx={{ mt: 1 }}
            fullWidth
            variant="outlined"
            size="md"         
            placeholder={"IP Address: " + (!aiEndpoint ? 'localhost' : JSON.parse(aiEndpoint)[0])}
            value={hostAddress ? hostAddress : 'localhost'}
            onChange={(e) => setHostAddress(e.target.value)}
            />
            <Input
            sx={{ mt: 1 }}
            fullWidth
            variant="outlined"
            size="md"  
            placeholder={"Port Number: " + (!aiEndpoint ? '11434' : JSON.parse(aiEndpoint)[1])}
            value={portNumber ? portNumber : '11434'}
            onChange={(e) => setPortNumber(e.target.value)}
            />
        </Sheet>
        <Button onClick={handleSetAIEndPoint}>Save</Button>
            <Typography id="modal-desc" textColor="text.tertiary" mt={2}>
            Configure your Ollama settings here.
        </Typography>
    </Sheet>
  )
}
