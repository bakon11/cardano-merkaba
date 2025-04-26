import React, { useState, useRef, useEffect } from 'react'
import { Sheet, Input, Button, List, ListItem, Typography, Divider, FormHelperText, FormControl, FormLabel } from '@mui/joy'
import { useModel } from '../../hooks/useModel'
import { Ollama } from 'ollama/browser'
import { useAIEndpoint } from '../../hooks/ollamaEndPointHook'
import { SelectOllamaModel } from '../SelectModelComponent/SelectModelComponent'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { BlockMath, InlineMath } from 'react-katex'
import { duotoneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useColorScheme } from '@mui/joy/styles'
import rehypeRaw from 'rehype-raw';
import Markdown from 'react-markdown'
import { wsp, getCurrentEpochTime } from '../../API/ogmios'
import SendIcon from '@mui/icons-material/Send'
import ClearIcon from '@mui/icons-material/Clear'
import brain from '../../assets/artificial-intelligence.gif'
import brain_dark from '../../assets/artificial-intelligence-dark.gif'
import './PromptInputInterface.css'
import 'katex/dist/katex.min.css'



interface Message {
  role: 'user' | 'assistant' | 'thinking'
  content: string | React.ReactNode
}
interface MessageHistory {
    role: 'system' | 'user' | 'assistant' | 'thinking';
    content: string | React.ReactNode;
  }

const text = {
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

export const PromptInputInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [messageHistory, setMessageHistory] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [model, setModel]: any = useModel()
  const [images, setImages] = useState<string[]>([])
  const [domain, setDomain] = useState('')
  const [aiEndpoint, setAIendpoint]: any = useAIEndpoint()
  const { mode, setMode } = useColorScheme()
  const [ contextSize, setContextSize ] = useState(42000);
  const [ temp, setTemp ] = useState(0.5);
  const [ persona , setPersona ] = useState('Franklin D. Roosevelt');
  const [ epochInfo, setEpochInfo ] = useState<any>();
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const agentPrompt = `
  You are an AI agent assisting with Cardano governance proposals, take on the persona of ${persona}.
                You are an Merkaba Sentient assisting with Cardano infromation assiting users to become sovereign and exit the Matrix. 
                Format responses in Markdown. Use the conversation history and respond to the user's input directly.
  `


  function scrollToBottom() {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

/**
  -------------------------------------- 
  This is where it all starts 
  -------------------------------------- 
  */
  async function sendMessage() {
    if (!input.trim()) return;
  
    const userMessage: Message = { role: 'user', content: input };
  
    setMessages((prev) => [...prev, userMessage]);
    setMessageHistory((prev) => [...prev, userMessage]);
    setInput('');
  
    setMessages((prev) => [
      ...prev,
      { 
        role: 'thinking', 
        content: <img src={mode === "dark" ? brain_dark : brain} alt="brain" height="50" /> 
      },
    ]);
  
    try {
      console.log("messageHistory", messageHistory);
      const aiEndpointParsed = JSON.parse(aiEndpoint);
      const host = aiEndpointParsed[0];
      const port = aiEndpointParsed[1];
      const urlHost = `${host}:${port}`;
      const ollama: any = new Ollama({ host: `${urlHost}` });
  
      const response: any = await ollama.chat({
        model: model,
        messages: [
          { 
            role: 'system', 
            content: agentPrompt 
          }, // Agent instructions
          ...messageHistory,
          { 
            role: 'user', 
            content: input 
          }, // Current user query
        ],
        stream: true,
        options: {
          num_ctx: contextSize, // Custom context size
          temperature: temp // Make responses more deterministic
        }
      });
  
      let accumulatedResponse = '';
      setMessages((prev) => prev.filter((item) => item.role !== 'thinking'));
  
      for await (const part of response) {
        accumulatedResponse += part.message.content;
        const renderedContent = renderMessageContent(accumulatedResponse);
        setMessages((prev) => {
          const withoutThinking = prev.filter((item) => item.role !== 'thinking');
          const lastWasAssistant = withoutThinking[withoutThinking.length - 1]?.role === 'assistant';
          if (lastWasAssistant) {
            return [...withoutThinking.slice(0, -1), { role: 'assistant', content: renderedContent }];
          }
          return [...withoutThinking, { role: 'assistant', content: renderedContent }];
        });
      }
  
      setMessageHistory((prev) => [...prev, { role: 'assistant', content: accumulatedResponse }]);
      // console.log("token count", await getConversationTokenCount(messageHistory));
    } catch (error) {
      console.log('Error in sendMessage:', error);
      setMessages((prev) => [
        ...prev.filter((item) => item.role !== 'thinking'),
        { role: 'assistant', content: `${error}` },
      ]);
    }
  };


  async function loadData ( data: string = "", dataName: string = "") {
    setMessageHistory((prev: MessageHistory[]) => [
      ...prev.filter((msg) => !(msg.role === 'system' && typeof msg.content === 'string' && msg.content.startsWith(`${dataName} data:`))),
      { role: 'system', content: `${dataName} data: ${data}` },
    ]);
  };
  /**
  ----------------------------------------------------------------------------  
  Function that fetches epoch information and adds it as part of agent history.
  ----------------------------------------------------------------------------  
  */
  async function agentGetEpochInformationTool() {
    try {
      const epochTime = await getCurrentEpochTime();
      console.log('epochTime:', epochTime);
      const isDifferent = JSON.stringify(epochTime) !== JSON.stringify(epochInfo);
      console.log('isDifferent:', isDifferent);
      if (isDifferent) {
        setEpochInfo(epochTime);
        const epochContent = JSON.stringify(epochTime, null, 2);
        setMessageHistory((prev: any) => [
          ...prev.filter((msg) => !(msg.role === 'system' && msg.content.startsWith('Epoch data:'))),
          { role: 'system', content: `Epoch data: ${epochContent}` },
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch Epoch:', error);
      setMessageHistory((prev: any) => [
        ...prev,
        { role: 'system', content: 'Error: Could not fetch epoch data.' },
      ]);
    }
    setInterval(async () => {
      try {
        const epochTime = await getCurrentEpochTime();
        // console.log('epochTime:', epochTime);
        const isDifferent = JSON.stringify(epochTime) !== JSON.stringify(epochInfo);
        // console.log('isDifferent:', isDifferent);
        if (isDifferent) {
          setEpochInfo(epochTime);
          const epochContent = JSON.stringify(epochTime, null, 2);
          setMessageHistory((prev: any) => [
            ...prev.filter((msg) => !(msg.role === 'system' && msg.content.startsWith('Epoch data:'))),
            { role: 'system', content: `Epoch data: ${epochContent}` },
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch Epoch:', error);
        setMessageHistory((prev: any) => [
          ...prev,
          { role: 'system', content: 'Error: Could not fetch epoch data.' },
        ]);
      }
    }, 25000);
  };

  function renderMessageContent(msg: string | undefined): React.ReactNode {
    // Type guard for non-string input
    if (typeof msg !== 'string') {
      console.warn('Expected msg to be a string, received:', typeof msg);
      return msg as React.ReactNode;
    }
  
    // Helper function to preprocess math content
    const preprocessMath = (text: string): string => {
      return text
        .replace(/times/g, '\\cdot')      // Replace "times" with "\cdot" for multiplication
        .replace(/frac/g, '\\frac')       // Replace "frac" with "\frac" for fractions
        .replace(/\\(.)/g, '$1');         // Unescape backslashes
    };
  
    // Helper function to clean text by limiting consecutive newlines
    const cleanMessage = (text: string): string => {
      return text.replace(/\n{3,}/g, '\n\n');  // Replace 3+ newlines with 2
    };
  
    // Split message into parts: code blocks, block math, inline math, and regular text
    const parts = msg.split(/(```(\w+)?([\s\S]*?)```|\$\$[\s\S]*?\$\$|(?<!\\)\$(?:(?!\\).)*\$(?<!\\))/);
    const elements: React.ReactNode[] = [];
  
    // Process each part
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
  
      if (part && typeof part === 'string') {
        if (part.startsWith('```')) { // Handle code blocks
          const language = parts[i + 1] || 'text'; // Language or default to 'text'
          const code = parts[i + 2]?.trim() || ''; // Code content
          if (code) {
            elements.push(
              <Sheet key={`code-${i}`} variant="outlined" sx={{ borderRadius: 'sm', p: 1, mb: 1 }}>
                <Divider />
                <Typography level="body-sm" sx={{ fontWeight: 'bold' }}>AI code block:</Typography>
                <SyntaxHighlighter
                  language={language}
                  style={mode === 'dark' ? oneDark : duotoneLight}
                  customStyle={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                >
                  {code}
                </SyntaxHighlighter>
              </Sheet>
            );
            i += 2; // Skip the captured language and code parts
          }
        } else if (part.startsWith('$$  ') && part.endsWith('  $$')) { // Handle block math
          const math = part.slice(2, -2).trim();         // Extract math content
          const mathProcessed = preprocessMath(math);    // Preprocess math
          elements.push(
            <Typography key={`math-${i}`} level="body-md">
              <BlockMath>{mathProcessed}</BlockMath>
            </Typography>
          );
        } else { // Handle regular text or inline math
          const cleanedPart = cleanMessage(part);        // Clean the text
          const inlineMathRegex = /\$(.*?)\$/g;          // Regex for inline math
          let match: RegExpExecArray | null;
          let lastIndex = 0;
          const segments: string[] = [];
  
          // Split part into text and inline math segments
          while ((match = inlineMathRegex.exec(cleanedPart))) {
            if (match.index > lastIndex) {
              segments.push(cleanedPart.slice(lastIndex, match.index));
            }
            segments.push(match[0]);
            lastIndex = inlineMathRegex.lastIndex;
          }
          if (lastIndex < cleanedPart.length) {
            segments.push(cleanedPart.slice(lastIndex));
          }
  
          // Render segments
          const renderedSegments = segments.map((segment, idx) => {
            if (segment.startsWith('$') && segment.endsWith('$')) {
              const math = segment.slice(1, -1);         // Extract inline math content
              const mathProcessed = preprocessMath(math); // Preprocess math
              return <InlineMath key={`inline-math-${idx}`}>{mathProcessed}</InlineMath>;
            }
            return <Markdown rehypePlugins={[rehypeRaw]} key={`text-${idx}`}>{segment}</Markdown>;
          });
  
          elements.push(
            <Typography key={`desc-${i}`} level="body-md" sx={{ whiteSpace: 'pre-wrap' }}>
              {renderedSegments}
            </Typography>
          );
        }
      }
    }
    // Return rendered elements or fallback to plain text
    return elements.length > 0 ? elements : <Typography level="body-md">{msg}</Typography>;
  }



  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <>
      
    <Sheet
      sx={{
        top: 90,
        left: 60,
        width: 1400,
        height: "85vh",
        p: 4,
        bgcolor: 'background.body',
        color: 'text.primary',
        // overflowY: 'auto'
      }}
      >
        <Typography level="body-md" sx={text}>Merkaba Sentient</Typography>
        <hr />
        <br />
      <Sheet
        sx={{
          mt: 4,
          p: 4,
          margin: 'auto',
          bgcolor: 'background.level1',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '50vh',
          borderRadius: 'md',
          // overflow: 'hidden',
          boxShadow: 'sm',
          // overflowY: 'auto',
        }}
      >
        <List style={{ overflowY: 'auto'}}>
            {messages.map((msg, index) => (
              <ListItem
                key={index}
                sx={{ justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
              >
                <Sheet
                  variant="soft"
                  color={msg.role === 'user' ? 'primary' : 'secondary'}
                  sx={{
                    borderRadius: 'lg',
                    p: 1,
                    display: 'inline-block',
                    color: mode === 'dark' ? 'text.primary' : 'text.secondary'
                  }}
                >
                  <Typography>{msg.content}</Typography>
                </Sheet>
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
        </Sheet>

        <Sheet
          sx={{
            display: 'flex',
            p: 2,
            bgcolor: mode === 'dark' ? 'background.surface' : 'background.body',
            borderTop: '1px solid',
            borderColor: 'neutral.outlinedBorder',
            flexDirection: 'column',
            [`@media (min-width: 400px)`]: {
              flexDirection: 'row'
            }
          }}
        >
          <Input
            fullWidth
            variant="outlined"
            size="md"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                if (e.shiftKey) {
                  e.preventDefault()
                  setInput((prevInput) => prevInput + '\n')
                } else {
                  sendMessage()
                }
              }
            }}
            placeholder="Type a message"
            sx={{
              flexGrow: 1,
              [`@media (max-width: 400px)`]: {
                mb: 1
              },
              '& .MuiInput-input': {
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap'
              }
            }}
          />
          <SelectOllamaModel />
          <Button
            variant="outlined"
            color="primary"
            endDecorator={<SendIcon />}
            onClick={sendMessage}
            sx={{
              ml: 1,
              mt: 1,
              [`@media (min-width: 400px)`]: {
                ml: 1,
                mt: 0
              },
              maxHeight: '55px'
            }}
          >
            Send
          </Button>
          <Button
            variant="outlined"
            color="primary"
            endDecorator={<ClearIcon />}
            onClick={() => setMessages([])}
            sx={{
              ml: 1,
              mt: 1,
              [`@media (min-width: 400px)`]: {
                ml: 1,
                mt: 0
              },
              maxHeight: '55px'
            }}
          >
            Clear
          </Button>
          <Button
            variant="outlined"
            color="primary"
            endDecorator={<ClearIcon />}
            onClick={() => loadData(JSON.stringify(epochInfo, null, 2), 'Epoch')}
            sx={{
              ml: 1,
              mt: 1,
              [`@media (min-width: 400px)`]: {
                ml: 1,
                mt: 0
              },
              maxHeight: '55px'
            }}
          >
            Abort
          </Button>
        </Sheet>
        For testing purposes only.
        <Sheet
          sx={{
            display: 'flex',
            p: 2,
            bgcolor: mode === 'dark' ? 'background.surface' : 'background.body',
            borderTop: '1px solid',
            borderColor: 'neutral.outlinedBorder',
            flexDirection: 'column',
            [`@media (min-width: 400px)`]: {
              flexDirection: 'row'
            }
          }}
        >
          <FormControl>
            <FormLabel>Context Size</FormLabel>
            <Input
              //fullWidth
              variant="outlined"
              size="md"
              value={contextSize}
              type="number"
              onChange={(e) => setContextSize(Number(e.target.value))}
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  if (e.shiftKey) {
                    e.preventDefault()
                    setContextSize((prevInput) => prevInput)
                  } else {
                    setContextSize((prevInput) => prevInput)
                  }
                }
              }}
              placeholder="Context Size"
              sx={{
                flexGrow: 1,
                [`@media (max-width: 400px)`]: {
                  mb: 1
                },
                '& .MuiInput-input': {
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap'
                }
              }}
              
            />
            <FormHelperText>If you get RAM errors lower this.</FormHelperText>
          </FormControl>
          <FormControl>
            <FormLabel>Temperature:</FormLabel>
            <Input
              //fullWidth
              variant="outlined"
              size="md"
              type="number"
              value={temp}
              onChange={(e) => setTemp(Number(e.target.value))}
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  if (e.shiftKey) {
                    e.preventDefault()
                    setTemp((prevInput) => prevInput)
                  } else {
                    setTemp((prevInput) => prevInput)
                  }
                }
              }}
              placeholder="Temperature"
              sx={{
                flexGrow: 1,
                [`@media (max-width: 400px)`]: {
                  mb: 1
                },
                '& .MuiInput-input': {
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap'
                }
              }}
            />
            <FormHelperText>How creative should the llm be.</FormHelperText>
          </FormControl>
        </Sheet>
        <Sheet
          sx={{
            display: 'flex',
            p: 2,
            bgcolor: mode === 'dark' ? 'background.surface' : 'background.body',
            borderTop: '1px solid',
            borderColor: 'neutral.outlinedBorder',
            flexDirection: 'column',
            [`@media (min-width: 400px)`]: {
              flexDirection: 'row'
            }
          }}
        >
          <Input
            fullWidth
            variant="outlined"
            size="md"
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                if (e.shiftKey) {
                  e.preventDefault()
                  setPersona((prevInput) => prevInput + '\n')
                } else {
                  setPersona((prevInput) => prevInput + '\n')
                }
              }
            }}
            placeholder="Persona"
            sx={{
              flexGrow: 1,
              [`@media (max-width: 400px)`]: {
                mb: 1
              },
              '& .MuiInput-input': {
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap'
              }
            }}
          />
          <br />
          <FormHelperText>Short description of personality.</FormHelperText>
        </Sheet>
        {/*
        <Sheet
          sx={{
            display: 'flex',
            p: 2,
            bgcolor: mode === 'dark' ? 'background.surface' : 'background.body',
            borderTop: '1px solid',
            borderColor: 'neutral.outlinedBorder',
            flexDirection: 'column',
            [`@media (min-width: 400px)`]: {
              flexDirection: 'row'
            }
          }}
        >
          
          <Input
            fullWidth
            variant="outlined"
            size="md"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                if (e.shiftKey) {
                  e.preventDefault()
                  setDomain((prevInput) => prevInput + '\n')
                } else {
                  setDomain((prevInput) => prevInput + '\n')
                }
              }
            }}
            placeholder="Domain URL"
            sx={{
              flexGrow: 1,
              [`@media (max-width: 400px)`]: {
                mb: 1
              },
              '& .MuiInput-input': {
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap'
              }
            }}
          />
          
        </Sheet>
        */}
      </Sheet>
    </>
  )
}
