import { CardanoNetworkMagic, ChainPoint, ChainSyncClient, HandshakeAcceptVersion, HandshakeClient, HandshakeQueryReply, HandshakeRefuse, IVersionData, LocalStateQueryClient, MiniProtocol, QryAcquired, QryFailure, RefuseReasonHandshakeDecodeError, RefuseReasonRefuse, RefuseReasonVersionMismatch } from "@harmoniclabs/ouroboros-miniprotocols-ts";
import { logger } from "../utils/Logger";

export async function sync( chainSyncClient: ChainSyncClient ): Promise<ChainPoint>
{
    // get chain tip
    const tip = await new Promise<ChainPoint>( res => {
        chainSyncClient.once("rollBackwards", rollback => {
            res( rollback.tip.point ) 
        });
        chainSyncClient.requestNext();
    });

    // sync
    await new Promise<void>( res => {
        chainSyncClient.once("intersectFound", _ => res() );
        // chainSyncClient.once("intersectNotFound", thing => { throw thing; } );
        chainSyncClient.findIntersect([ tip ]);
    });

    return tip;
}

export function acquire( lsqClient: LocalStateQueryClient, point: ChainPoint ): Promise<void>
{
    // acquire tip local chain sync
    return new Promise<void>( (resolve, reject) => {

        function handleFailure()
        {
            lsqClient.removeEventListener("acquired", resolveAcquired)
            reject();
        }

        function resolveAcquired()
        {
            lsqClient.removeEventListener("failure", handleFailure);
            resolve();
        }

        lsqClient.once("failure", handleFailure);
        lsqClient.once("acquired", resolveAcquired);

        lsqClient.acquire( point );
    });
}

export async function syncAndAcquire(
    chainSyncClient: ChainSyncClient,
    lsqClient: LocalStateQueryClient,
    networkMagic: number
): Promise<ChainPoint>
{
    const mplexer = chainSyncClient.mplexer;

    const handshake = new HandshakeClient( mplexer );

    handshake.on("error", err => {
        logger.error("handshake error: ", err);
        process.exit(1); 
    });
    
    // handshake
    const handshakeResult = (
        await handshake
        .propose({
            networkMagic,
            query: false
        })
    );
    if(!(
        handshakeResult instanceof HandshakeAcceptVersion
        // || handshakeResult instanceof HandshakeQueryReply
    ))
    {
        logger.error("handshake failed: ", handshakeResult);
        if( handshakeResult instanceof HandshakeRefuse )
        {
            const reason = handshakeResult.reason;
            if( reason instanceof RefuseReasonRefuse )
            {
                logger.error("refuse reason: ", reason.errorMessage );
            }
            else if( reason instanceof RefuseReasonVersionMismatch )
            {
                logger.error("cardano node only supports protocol version: ", reason.validVersions );
            }
            else if( reason instanceof RefuseReasonHandshakeDecodeError )
            {
                logger.error("handshake decode error");
            }
        }
        throw new Error("handshake failed");
    }

    logger.debug("handshake success");

    const tip = await sync( chainSyncClient );

    return tip;

    logger.debug("synced to tip: ", tip.toJson());

    function acqHandler( evt: QryAcquired )
    {
        logger.debug("ledger state acquired: ", evt.toJson());
        lsqClient.off("failure", failHandler);
        lsqClient.off("acquired", acqHandler);
    }
    function failHandler( evt: QryFailure )
    {
        logger.debug("ledger state acquisition failed: ", evt.toJson());
        lsqClient.off("failure", failHandler);
        lsqClient.off("acquired", acqHandler);
    }

    lsqClient.once("acquired", acqHandler);
    lsqClient.once("failure", failHandler);
    lsqClient.on("error", err => {
        logger.error("lsqClient error: ", err.message);
    });

    await acquire( lsqClient, tip );

    logger.debug("acquired tip");

    return tip;
}