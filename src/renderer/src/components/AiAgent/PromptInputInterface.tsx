import React, { useState, useRef, useEffect } from 'react'
import { Sheet, Input, Button, List, ListItem, Typography, Divider } from '@mui/joy'
import SendIcon from '@mui/icons-material/Send'
import ClearIcon from '@mui/icons-material/Clear'
import { useModel } from '../../hooks/useModel'
import { Ollama } from 'ollama/browser'
import { useAIEndpoint } from '../../hooks/ollamaEndPointHook'
import { SelectOllamaModel } from '../../components/SelectModelComponent/SelectModelComponent'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import Markdown from 'react-markdown'
import { BlockMath, InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import { duotoneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useColorScheme } from '@mui/joy/styles'
import './PromptInputInterface.css'
import brain from '../../assets/artificial-intelligence.gif'
import { wsp } from '../../API/ogmios'

interface Message {
  role: 'user' | 'assistant' | 'thinking'
  content: string | React.ReactNode
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  function scrollToBottom() {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  /* 
  -------------------------------------- 
  This is where it all starts 
  -------------------------------------- 
  */
  async function sendMessage() {
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input }

    setMessages((prev) => [...prev, userMessage])
    setMessageHistory((prev) => [...prev, userMessage])
    setInput('')

    setMessages((prev) => [
      ...prev,
      { role: 'thinking', content: <img src={brain} alt="brain" height="50" /> }
    ])

    try {
      console.log('input:', input.toLowerCase().includes('governance proposals'))
      const isToolRequest =
        input.toLowerCase().includes('list') ||
        input.toLowerCase().includes('proposal') ||
        input.toLowerCase().includes('governance proposals') ||
        input.toLowerCase().includes('search') ||
        input.toLowerCase().includes('find')

      console.log('isToolRequest:', isToolRequest)

      if (isToolRequest) {
        const toolResult = await agentProcess(input)
        const renderedContent = renderMessageContent(toolResult)
        console.log('renderedContent: ', renderedContent)
        setMessages((prev) => [
          ...prev.filter((item) => item.role !== 'thinking'),
          { role: 'assistant', content: renderedContent }
        ])
        setMessageHistory((prev) => [...prev, { role: 'assistant', content: toolResult }])
      } else {
        const aiEndpointParsed = JSON.parse(aiEndpoint)
        const host = aiEndpointParsed[0]
        const port = aiEndpointParsed[1]
        let protocol = port == 443 ? 'https' : 'http'
        let urlHost =
          host +
          ((protocol == 'https' && port != 443) || (protocol == 'http' && port != 80)
            ? ':' + port
            : '')
        const ollama = new Ollama({ host: `${urlHost}` })

        const response = await ollama.chat({
          model: model,
          messages: [
            {
              role: 'system',
              content: `
              You are an Merkaba Sentient assisting with Cardano infromation assiting users to become sovereign and exit the Matrix. 
              Format responses in Markdown. Use the conversation history and respond to the user's input directly.
            `
            },
            ...messageHistory,
            { role: 'user', content: input }
          ],
          stream: true
        })

        let accumulatedResponse = ''
        setMessages((prev) => prev.filter((item) => item.role !== 'thinking'))

        for await (const part of response) {
          accumulatedResponse += part.message.content
          const renderedContent = renderMessageContent(accumulatedResponse)

          setMessages((prev) => {
            const withoutThinking = prev.filter((item) => item.role !== 'thinking')
            const lastWasAssistant =
              withoutThinking[withoutThinking.length - 1]?.role === 'assistant'

            if (lastWasAssistant) {
              return [
                ...withoutThinking.slice(0, -1),
                { role: 'assistant', content: renderedContent }
              ]
            }
            return [...withoutThinking, { role: 'assistant', content: renderedContent }]
          })
        }

        setMessageHistory((prev) => [...prev, { role: 'assistant', content: accumulatedResponse }])
      }
    } catch (error) {
      console.error('Error in sendMessage:', error)
      setMessages((prev) => [
        ...prev.filter((item) => item.role !== 'thinking'),
        { role: 'assistant', content: 'Error occurred while processing your request' }
      ])
    }
  }

  /* 
  ----------------------------------------------------------------------------  
  Function that queries the ledger state for governance proposals
  ----------------------------------------------------------------------------  
  */
  async function getProposal() {
    const method: string = 'queryLedgerState/governanceProposals'
    const params = {}

    let wspRes = await wsp(method, params)
    return new Promise((resolve, reject) => {
      wspRes.onmessage = async (e: any) => {
        try {
          const results = JSON.parse(e.data)
          const parsedProposals = await parseResults(results.result)
          resolve(parsedProposals)
        } catch (error) {
          reject(error)
        }
      }
    })
  }
  /* 
  ----------------------------------------------------------------------------  
  Function that parses all the metadata from the onchain proposals
  ----------------------------------------------------------------------------  
  */
  async function parseResults(results: any[]): Promise<Array<{ proposal: any; metadata: any }>> {
    console.log('results', results)
    try {
      const parsedProposals = await Promise.all(
        results.map(async (proposal: any) => {
          const metadataUri = proposal.metadata.url
          const metadata: any = await loadJsonMetadata(metadataUri)
          const propInfo: any = { proposal, metadata }
          console.log('propInfo', propInfo)
          return propInfo
        })
      )
      return parsedProposals
    } catch (error) {
      console.log('Error parsing results:', error)
      return []
    }
  }
  /* 
  ----------------------------------------------------------------------------  
  Fetches metadata from IPFS or HTTP specified in onchain proposal
  ----------------------------------------------------------------------------  
  */
  async function loadJsonMetadata(metadataUri: string) {
    let uri = metadataUri.startsWith('ipfs://')
      ? `https://ipfs.onchainapps.io/ipfs/${metadataUri.slice(7)}`
      : metadataUri

    try {
      const response = await fetch(uri)
      if (!response.ok) {
        console.warn('Failed to fetch metadata:', response.statusText)
        return null
      }
      const jsonData = await response.json()
      if (jsonData.body) {
        for (const key in jsonData.body) {
          if (typeof jsonData.body[key] === 'string') {
            jsonData.body[key] = preprocessMath(jsonData.body[key])
          }
        }
      }
      console.log('Metadata fetched:', jsonData)
      return jsonData
    } catch (error) {
      console.error('Error loading metadata:', error)
      return null
    }
  }
  /* 
  ----------------------------------------------------------------------------  
  Process math equations in text
  ----------------------------------------------------------------------------  
  */
  const preprocessMath = (text: string): string => {
    return text.replace(/times/g, '\\cdot').replace(/frac/g, '\\frac').replace(/\\(.)/g, '$1') // Unescapes backslashes if needed
  }

  /* 
  ----------------------------------------------------------------------------  
  Renders all markdown content in the chat interface that's been preprocessed
  ----------------------------------------------------------------------------  
  */
  function renderMessageContent(msg: string | undefined): React.ReactNode {
    if (typeof msg !== 'string') {
      console.warn('Expected msg to be a string, received:', typeof msg)
      return msg as React.ReactNode // Type assertion since we can't return 'msg' directly as ReactNode
    }

    const parts = msg.split(
      /(```(\w+)?([\s\S]*?)```|\$\$[\s\S]*?\$\$|(?<!\\)\$(?:(?!\\).)*\$(?<!\\))/
    )

    const elements: React.ReactNode[] = []

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]

      if (part && typeof part === 'string') {
        if (part.startsWith('```')) {
          // Code block
          const language = parts[i + 1] || 'text'
          const code = parts[i + 2]?.trim() || ''
          if (code) {
            console.log('language: ', language)
            elements.push(
              <Sheet key={`code-${i}`} variant="outlined" sx={{ borderRadius: 'sm', p: 1, mb: 1 }}>
                <Divider />
                <Typography level="body-sm" sx={{ fontWeight: 'bold' }}>
                  AI code block:
                </Typography>
                <SyntaxHighlighter
                  key={`code-block-${i}`}
                  language={language}
                  style={mode === 'dark' ? oneDark : duotoneLight}
                >
                  {code}
                </SyntaxHighlighter>
              </Sheet>
            )
            i += 2
          }
        } else if (part.startsWith('$$') && part.endsWith('$$')) {
          // Block Math
          const math = part.slice(2, -2).trim()
          elements.push(
            <Typography key={`math-${i}`} level="body-md">
              <BlockMath>{math}</BlockMath>
            </Typography>
          )
        } else {
          // Regular text or inline math
          const inlineMathRegex = /\$(.*?)\$/g
          let match: RegExpExecArray | null
          let lastIndex = 0
          const segments: string[] = []

          while ((match = inlineMathRegex.exec(part))) {
            if (match.index > lastIndex) {
              segments.push(part.slice(lastIndex, match.index))
            }
            segments.push(match[0])
            lastIndex = inlineMathRegex.lastIndex
          }
          if (lastIndex < part.length) {
            segments.push(part.slice(lastIndex))
          }

          const renderedSegments = segments.map((segment, idx) => {
            if (segment.startsWith('$') && segment.endsWith('$')) {
              return <InlineMath key={`inline-math-${idx}`}>{segment.slice(1, -1)}</InlineMath>
            }
            return <Markdown key={`text-${idx}`}>{segment}</Markdown>
          })

          elements.push(
            <Typography key={`desc-${i}`} level="body-md" sx={{ whiteSpace: 'pre-wrap' }}>
              {renderedSegments}
            </Typography>
          )
        }
      }
    }

    return elements.length > 0 ? elements : <Typography level="body-md">{msg}</Typography>
  }
  /* 
  ----------------------------------------------------------------------------  
  Proccess user input to see if there is anything in it that could be processed by agent tool.
  ----------------------------------------------------------------------------  
  */
  const agentProcess = async (userInput: string): Promise<string> => {
    const lowercaseInput = userInput.toLowerCase().trim()

    // Tool detection and execution
    if (
      lowercaseInput.includes('list') ||
      lowercaseInput.includes('proposal') ||
      lowercaseInput.includes('governance proposals')
    ) {
      const fetchedProposals: any = await getProposal()
      console.log('fetchedProposals:', fetchedProposals)
      return availableTools['list_proposals'].execute(fetchedProposals)
    }

    if (lowercaseInput.includes('search') || lowercaseInput.includes('find')) {
      return availableTools['web_search'].execute(userInput)
    }

    // Default LLM processing with context
    const aiEndpointParsed = JSON.parse(aiEndpoint)
    const host = aiEndpointParsed[0]
    const port = aiEndpointParsed[1]
    let protocol = port == 443 ? 'https' : 'http'
    let urlHost = host + ((protocol == 'https' && port != 443) || (protocol == 'http' && port != 80) ? ':' + port : '')
    const ollama = new Ollama({ host: `${urlHost}` })
    const systemPrompt = `You are a Merkaba Sentient named Bit assisting with information on the matrix and Cardano. 
                          You have access to vast information on Cardano data and can provide detailed information when asked. 
                          For general questions, respond conversationally. Format your responses in Markdown for readability.
  
                          Available tools:
                          - **list_tools**: Lists all dev tools with details
                          - **web_search**: Simulates a web search (placeholder)
  
                          Current tool data is available but will be provided by tools when needed. Respond to the user's input directly.
                          `

    const response = await ollama.chat({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messageHistory,
        { role: 'user', content: userInput }
      ],
      stream: false // We'll handle streaming in sendMessage
    })

    return response.message.content
  }

  const availableTools = {
    list_proposals: {
      description: 'Lists all available proposals with details in Markdown format',
      execute: (proposalData: any[]) => {
        console.log('proposalData: ', proposalData)
        if (!proposalData || proposalData.length === 0) {
          return 'No proposals available'
        }
        const proposalList = proposalData
          .map((item: any, i: number) => {
            const p = item.proposal
            const meta = item.metadata?.body || {}
            const voteSummary = p.votes.reduce((acc: any, vote: any) => {
              acc[vote.vote] = (acc[vote.vote] || 0) + 1
              return acc
            }, {})
            return `
              ### ${i + 1}. ${meta.title || 'Untitled'}  
              **ID:** \`${p.proposal.transaction.id}\`  
              **Type:** ${p.action.type}  
              **Deposit:** ${(p.deposit.ada.lovelace / 1000000).toLocaleString()} ADA  
              **Active Period:** Epoch ${p.since.epoch} to ${p.until.epoch}  
              **Metadata URL:** [${p.metadata.url}](${p.metadata.url})  
              **Votes:**  
              - Yes: ${voteSummary.yes || 0}  
              - No: ${voteSummary.no || 0}  
              - Abstain: ${voteSummary.abstain || 0}  
              **Description:** ${meta.abstract || 'No description available'}
            `
          })
          .join('\n\n')
        return proposalList || 'No proposals found'
      }
    },
    web_search: {
      description: 'Searches the web for information',
      execute: (query: string) => `
        **Web Search:**  
        Searching web for: *${query}*  
        *(Note: Full implementation would require API integration)*
        `
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <>
      
    <Sheet
      sx={{
        top: 60,
        left: 60,
        width: 1400,
        height: "92vh",
        p: 4,
        bgcolor: 'background.body',
        color: 'text.primary'
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
          height: '70vh',
          borderRadius: 'md',
          overflow: 'hidden',
          boxShadow: 'sm',
          overflowY: 'auto',
        }}
      >
        
        <List>
            {messages.map((msg, index) => (
              <ListItem
                key={index}
                sx={{ justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
              >
                <Sheet
                  variant="soft"
                  color={msg.role === 'user' ? 'primary' : 'neutral'}
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
            [`@media (min-width: 400px)`]: { flexDirection: 'row' }
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
              [`@media (max-width: 400px)`]: { mb: 1 },
              '& .MuiInput-input': { wordWrap: 'break-word', whiteSpace: 'pre-wrap' }
            }}
          />
          <br />
          <SelectOllamaModel />
          <Button
            variant="outlined"
            color="primary"
            endDecorator={<SendIcon />}
            onClick={sendMessage}
            sx={{
              ml: 1,
              mt: 1,
              [`@media (min-width: 400px)`]: { ml: 1, mt: 0 },
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
              [`@media (min-width: 400px)`]: { ml: 1, mt: 0 },
              maxHeight: '55px'
            }}
          >
            Clear
          </Button>
        </Sheet>
        <Sheet
          sx={{
            display: 'flex',
            p: 2,
            bgcolor: mode === 'dark' ? 'background.surface' : 'background.body',
            borderTop: '1px solid',
            borderColor: 'neutral.outlinedBorder',
            flexDirection: 'column',
            [`@media (min-width: 400px)`]: { flexDirection: 'row' }
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
              [`@media (max-width: 400px)`]: { mb: 1 },
              '& .MuiInput-input': { wordWrap: 'break-word', whiteSpace: 'pre-wrap' }
            }}
          />
        </Sheet>
      </Sheet>
      
    </>
  )
}
