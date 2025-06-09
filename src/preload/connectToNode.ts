import { ChainSyncClient, LocalStateQueryClient, Multiplexer, MiniProtocol  } from "@harmoniclabs/ouroboros-miniprotocols-ts";
import { Cbor, CborArray, CborBytes, CborObj, CborTag, LazyCborArray, LazyCborObj } from "@harmoniclabs/cbor";
import { toHex } from "@harmoniclabs/uint8array-utils";
import { connect } from "net";
import { syncAndAcquire } from './funcs/syncAndAcquire';
import { WebSocketServer, WebSocket } from 'ws';

import { logger } from "./utils/Logger";

export async function connectToNode()
{

    const WEBSOCKET_PORT = 8080;

    // Create WebSocket server
    const wss = new WebSocketServer({ port: WEBSOCKET_PORT });
    
    // Track connected WebSocket clients
    const clients = new Set<WebSocket>();
    
    // Handle WebSocket connections
    wss.on('connection', (ws: WebSocket) => {
      console.log('New WebSocket client connected');
      clients.add(ws);
    
      // Handle WebSocket client disconnection
      ws.on('close', () => {
        console.log('WebSocket client disconnected');
        clients.delete(ws);
      });
    
      // Handle WebSocket errors
      ws.on('error', (error: Error) => {
        console.error('WebSocket error:', error);
        clients.delete(ws);
      });
    });
    
    // Handle server errors
    wss.on('error', (error: Error) => {
        console.error('WebSocket server error:', error);
    });
      
    // Log when WebSocket server is running
    wss.on('listening', () => {
        console.log(`WebSocket server running on ws://localhost:${WEBSOCKET_PORT}`);
    });    

    // Create IPC socket client
    const mplexer = new Multiplexer({
        connect: () => {
            logger.info(`Attempt connection to preprod-node.play.dev.cardano.org:3001`);
            return connect({
                host: "preprod-node.play.dev.cardano.org",
                port: 3001,
            }) as any;
        },
        protocolType: "node-to-node",
        initialListeners: {
            error: [ logger.error ],
            [MiniProtocol.Handshake]: [ payload => logger.debug(`Received handshake: ` + toHex( payload )) ]
        }
    });
    
    // Handle IPC socket errors
    mplexer.on("error", err => {
        logger.error("mplexer error: ", err);
        // process.exit(1);
    });

    // Handle incoming data from IPC socket
    /*
    mplexer.on('data', (data: Buffer) => {
    const message = data.toString();
    console.log('Received from IPC:', message);

    // Relay data to all connected WebSocket clients
    clients.forEach((client: WebSocket) => {
        if (client.readyState === WebSocket.OPEN) {
        client.send(message);
        }
    });
    });
    */

    const chainSyncClient = new ChainSyncClient( mplexer );
    const lsqClient = new LocalStateQueryClient( mplexer );
    chainSyncClient.on("error", err => {
        logger.error("chainSyncClient error: ", err);
        // process.exit(1);
    });
    lsqClient.on("error", err => {
        logger.error("lsqClient error: ", err);
        // process.exit(1);
    });
    // logger.debug("mplexer", mplexer);
    // logger.debug("chainSyncClient", chainSyncClient);
    // logger.debug("lsqClient", lsqClient);

    let tip = await syncAndAcquire( chainSyncClient, lsqClient, 1 );

    logger.info("tip", tip);
    
    chainSyncClient.on("rollForward", rollForward => {
        tip = rollForward.tip.point;

        console.log("tip:", tip);

        // Relay data to all connected WebSocket clients
        clients.forEach((client: WebSocket) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(tip));
            }
        });
         
    });
    chainSyncClient.on("rollBackwards", rollBack => {
        if( !rollBack.point.blockHeader ) return;
        
        tip = rollBack.tip.point;
        const hashStr = toHex( rollBack.point.blockHeader.hash );
        console.log("rollBack", hashStr);
    });

    while( true )
    {
        void await chainSyncClient.requestNext();
    }
}
