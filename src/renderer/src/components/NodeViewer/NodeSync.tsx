import * as React from 'react';
import { Sheet, Typography, Button, Input, Stack } from '@mui/joy';

export const NodeSyncView: React.FC = () => {
  const connectToNode = (): Promise<any> => window.api.connectToNode();
  const [messages, setMessages] = React.useState<string[]>([]);
  const [host, setHost] = React.useState<string>('localhost');
  const [port, setPort] = React.useState<string>('8080');
  const [isConnected, setIsConnected] = React.useState<boolean>(false);
  const wsRef = React.useRef<WebSocket | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const isAtBottomRef = React.useRef<boolean>(true);

  // Connect to WebSocket
  const connectWebSocket = React.useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const wsUrl = `ws://${host}:${port}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setMessages((prev) => [...prev, `[INFO] Connected to ${wsUrl}`]);
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      // Check if at bottom before adding new message
      if (containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        isAtBottomRef.current = scrollTop + clientHeight >= scrollHeight - 10; // Small buffer for precision
      }
      const data = typeof event.data === 'string' ? event.data : JSON.stringify(event.data);
      setMessages((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${data}`]);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setMessages((prev) => [...prev, '[ERROR] WebSocket error']);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setMessages((prev) => [...prev, `[INFO] Disconnected from ${wsUrl}`]);
      setIsConnected(false);
    };

    wsRef.current = ws;
  }, [host, port]);

  // Disconnect WebSocket
  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const localNode = async () => {
    const n2nSync = await connectToNode();
    console.log('Connected to local node:', n2nSync);
  };
  
  // Initialize WebSocket on mount
  React.useEffect(() => {
    localNode();
    connectWebSocket();

    // Cleanup on unmount
    return () => {
      disconnectWebSocket();
    };
  }, [connectWebSocket]);

  // Auto-scroll to bottom on new messages
  React.useEffect(() => {
    if (isAtBottomRef.current && messagesEndRef.current && containerRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        console.log(
          'Scrolled to bottom. Scroll height:',
          containerRef.current?.scrollHeight,
          'Client height:',
          containerRef.current?.clientHeight,
          'Scroll top:',
          containerRef.current?.scrollTop
        );
      });
    }
  }, [messages]);

  // Update isAtBottomRef on scroll
  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      isAtBottomRef.current = scrollTop + clientHeight >= scrollHeight - 10; // Small buffer
      console.log(
        'Scroll position updated. At bottom:',
        isAtBottomRef.current,
        'Scroll top:',
        scrollTop,
        'Scroll height:',
        scrollHeight,
        'Client height:',
        clientHeight
      );
    }
  };

  return (
    <Sheet sx={{ width: '100%', height: '100%', bgcolor: 'background.level1', borderRadius: 'sm', p: 2, display: 'flex', flexDirection: 'column' }}>
      <Typography level="h4" sx={{ mb: 2 }}>Node Sync View</Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Input
          placeholder="WebSocket Host"
          value={host}
          onChange={(e) => setHost(e.target.value)}
          sx={{ width: '200px' }}
        />
        <Input
          placeholder="WebSocket Port"
          value={port}
          onChange={(e) => setPort(e.target.value)}
          sx={{ width: '100px' }}
        />
        <Button
          onClick={connectWebSocket}
          disabled={isConnected}
          color="primary"
        >
          Reconnect
        </Button>
        <Button
          onClick={disconnectWebSocket}
          disabled={!isConnected}
          color="danger"
        >
          Disconnect
        </Button>
        <Button
          onClick={() => setMessages([])}
          color="danger"
        >
          Clear
        </Button>
      </Stack>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          maxHeight: '100%',
          backgroundColor: '#1e1e1e',
          color: '#00ff00',
          fontFamily: '"Courier New", Courier, monospace',
          fontSize: '14px',
          padding: '10px',
          borderRadius: '4px',
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
        <div ref={messagesEndRef} style={{ height: '1px' }} />
      </div>
    </Sheet>
  );
};