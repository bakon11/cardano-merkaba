import { Address, TxOut, TxOutRef, UTxO } from "@harmoniclabs/cardano-ledger-ts";
import { Cbor, CborArray, CborBytes, CborMap, CborUInt } from "@harmoniclabs/cbor";
import { LocalStateQueryClient } from "@harmoniclabs/ouroboros-miniprotocols-ts";
import { lexCompare } from "@harmoniclabs/uint8array-utils";
import { logger } from "../utils/Logger";

export async function queryAddrsUtxos( client: LocalStateQueryClient, addrs: Address[] ): Promise<UTxO[]>
{
    const query = new CborArray([
        new CborUInt( 0 ),
        new CborArray([
            new CborUInt( 0 ),
            new CborArray([
                new CborUInt( 6 ),
                new CborArray([
                    new CborUInt( 6 ),
                    new CborArray(
                        addrs
                        .map( addr => addr.toBuffer() )
                        .sort( lexCompare )
                        .map( b => new CborBytes( b ) )
                    )
                ])
            ])
        ])
    ]);

    const { result: cborResult } = await client.query( query, 30_000 );

    const map = ((cborResult as CborArray)?.array[0] as CborMap)?.map;

    if( !map ) return [];

    const result = map.map(({ k, v }) =>
        new UTxO({
            utxoRef: TxOutRef.fromCborObj( k ),
            resolved: TxOut.fromCborObj( v )
        })
    );

    logger.debug("queried utxos", result.length);

    return result;
    
}