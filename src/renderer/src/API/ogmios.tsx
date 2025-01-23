import * as React from 'react'
import { w3cwebsocket as W3CWebSocket } from 'websocket'
import * as pluts from '@harmoniclabs/plu-ts'
import { splitAsset, fromBuffer } from '../lib/utils'
import { OgmiosUtxos } from './utxosExample/'

interface OgmiosRequest {
  jsonrpc: '2.0'
  method: string
  params: object
  id: string
}
// Define the structure of each UTXO value
interface AssetValue {
  [key: string]: number
}

interface UtxoValue {
  ada?: {
    lovelace: number
  }
  [key: string]: AssetValue | undefined
}

export interface Utxo {
  transaction: {
    id: string
  }
  index: number
  address: string
  value: UtxoValue
}

interface Result {
  lovelace: number
  assets: {
    [key: string]: AssetValue
  }
}

let ws: W3CWebSocket | null = null;

export const wsp = (method: string, params: object): W3CWebSocket => {
  // Check if we already have an open connection
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log('WebSocket connection already open, reusing it.');
    const message: OgmiosRequest = {
      jsonrpc: '2.0',
      method,
      params,
      id: 'init-1234-5678'
    };

    try {
      ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Ogmios WS error on sending message:', error);
      sessionStorage.setItem('ogmiosHealth', 'error');
    }
    return ws;
  }

  // If no connection exists or it's not open, proceed with creating one
  const backend = localStorage.getItem('backendHook') || JSON.stringify(['ogmios', 'ws://192.168.1.247:1337', '', '']);
  const backendConfig = JSON.parse(backend);
  console.log('backend', backendConfig[0]);

  if (!backendConfig[1]) {
    console.warn('Backend configuration is missing URL, setting default');
    localStorage.setItem('backendHook', JSON.stringify(['ogmios', 'ws://192.168.1.247:1337', '', '']));
    return;
  }

  ws = new W3CWebSocket(backendConfig[1]);

  ws.onopen = () => {
    console.log('Ogmios Connection opened');
    sessionStorage.setItem('ogmiosHealth', 'connected');

    const message: OgmiosRequest = {
      jsonrpc: '2.0',
      method,
      params,
      id: 'init-1234-5678'
    };

    try {
      ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Ogmios WS error on sending message:', error);
      sessionStorage.setItem('ogmiosHealth', 'error');
    }
  };

  ws.onerror = (error: Event) => {
    console.error('Ogmios Connection Error:', error);
    sessionStorage.setItem('ogmiosHealth', 'error');
  };

  ws.onclose = (event: CloseEvent) => {
    console.log('Ogmios Connection closed:', event);
    sessionStorage.setItem('ogmiosHealth', 'closed');
    ws = null; // Reset the WebSocket when it closes
  };

  return ws;
};

/*
##########################################################################################################
Fetching Chain info and Ogmios health
#############################d############################################################################
*/
export const ogmiosHealth = async () => {
  const requestOptions: any = {
    method: 'GET',
    redirect: 'follow'
  }

  let settings = {}
  settings = {
    method: 'GET',
    headers: {},
    redirect: 'follow'
  }
  try {
    const fetchResponse = await fetch(`${ogmiosServer}/health`, requestOptions)
    const data = await fetchResponse.json()
    // console.log(data);
    return data
  } catch (e) {
    console.log(e)
    return e
  }
}

export const getAccountUtxoInfoOgmios = async (addresses: string[]): Promise<Utxo[] | null> => {
  const params = {
    addresses: [...addresses]
  }

  try {
    const accountInfoWS = wsp('queryLedgerState/utxo', params)
    console.log('accountInfoWS', accountInfoWS)
    return await new Promise((resolve, reject) => {
      accountInfoWS.onmessage = (e: MessageEvent) => {
        try {
          const results = JSON.parse(e.data)
          console.log('WebSocket message received:', results)
          resolve(results.result as Utxo[]) // Type assertion for Utxo array
        } catch (parseError) {
          console.error('Error parsing WebSocket message:', parseError)
          reject(parseError)
        }
      }

      accountInfoWS.onerror = (error: Event) => {
        console.error('WebSocket error:', error)
        reject(error)
      }

      accountInfoWS.onclose = (event: CloseEvent) => {
        console.log('WebSocket connection closed:', event)
        if (!event.wasClean) {
          reject(new Error('WebSocket connection was closed unexpectedly'))
        } else {
          resolve(null) // Connection closed cleanly, but no data received
        }
      }
    })
  } catch (error) {
    console.error('Failed to get account info:', error)
    throw error // Re-throw to be handled by the caller if needed
  }
}


export const parseOgmiosUtxosForWallet = (utxos: Utxo[]): Result => {
  // utxos = OgmiosUtxos
  let totalLovelace: number = 0
  const assets: { [key: string]: AssetValue } = {}

  // Loop through each UTXO
  utxos.forEach((utxo: Utxo) => {
    // Sum ADA
    if (utxo.value.ada && utxo.value.ada.lovelace !== undefined) {
      totalLovelace += utxo.value.ada.lovelace
    }

    // Handle other assets
    Object.entries(utxo.value).forEach(([assetKey, assetValues]) => {
      if (assetKey !== 'ada' && assetValues !== undefined) {
        if (!assets[assetKey]) {
          assets[assetKey] = {}
        }

        Object.entries(assetValues).forEach(([subKey, value]) => {
          if (value !== undefined) {
            if (!assets[assetKey][subKey]) {
              assets[assetKey][subKey] = 0
            }
            assets[assetKey][subKey] += value
          }
        })
      }
    })
  })

  // Result structure
  const result: Result = {
    lovelace: totalLovelace,
    assets: assets
  }

  console.log('result, ', result)
  return result
}

/*
##########################################################################################################
Generate inputs for PLU-TS from utxoInputsOgmios
#############################d############################################################################
*/
export const paraseOgmiosUtxoToPlutsTX = async (utxoInputsOgmios: any) => {
  let inputs: any = []
  Promise.all(
    await utxoInputsOgmios.map(async (utxo: any) => {
      // console.log("adding inputs")
      inputs.push(
        new pluts.UTxO({
          utxoRef: {
            id: utxo.transaction_id,
            index: utxo.output_index
          },
          resolved: {
            address: pluts.Address.fromString(utxo.address),
            value: await createInputValuesOgmios(utxo)
            // datum: [], // parse kupo datum
            // refScript: [] // look for ref script if any
          }
        })
      )
      // console.log("address used", pluts.Address.fromString(utxo.address).paymentCreds)
    })
  )
  const inputsKupoParsed = inputs.map((utxo: any) => ({ utxo: utxo }))
  return inputsKupoParsed
}

/*
####################################################################################################################################################################################################################
This function will create UTXO input values like: UTXO lovelaces and UTXO assets for PLU-TS to be used with paraseOgmiosUtxoToPlutsTX() function
####################################################################################################################################################################################################################
*/
const createInputValuesOgmios = async (kupoUtxo: any) => {
  // console.log("kupoUtxo", kupoUtxo);
  // for now will just pick first utxo object from array
  let kupoAssets: any = []
  Promise.all(
    Object.entries(kupoUtxo.value).map(([key, value]: any) => {
      // console.log("key", key);
      // console.log("value", value);
      key === 'coins' && kupoAssets.push(pluts.Value.lovelaces(kupoUtxo.value.coins))
      key === 'assets' &&
        Object.entries(value).length > 0 &&
        Object.entries(value).map(([asset, quantity]: any) => {
          let assetNew = pluts.Value.singleAsset(
            new pluts.Hash28(splitAsset(asset)[0]),
            fromBuffer(splitAsset(asset)[1]),
            quantity
          )
          kupoAssets.push(assetNew)
        })
    })
  )
  const kupoAssetsParsed = kupoAssets.map((asset: any) => ({ asset: asset }))
  // console.log("kupoAssetsParsed", kupoAssetsParsed);
  return kupoAssetsParsed
}

interface ProtocolParameters {
  txFeePerByte: number
  txFeeFixed: number
  maxBlockBodySize: number
  maxTxSize: number
  maxBlockHeaderSize: number
  stakeAddressDeposit: number
  stakePoolDeposit: number
  poolRetireMaxEpoch: number
  stakePoolTargetNum: number
  poolPledgeInfluence: number
  monetaryExpansion: number
  treasuryCut: number
  protocolVersion: number[]
  minPoolCost: number
  utxoCostPerByte: number
  costModels: {
    PlutusScriptV1: []
    PlutusScriptV2: []
  }
  executionUnitPrices: pluts.CborPositiveRational[]
  maxTxExecutionUnits: pluts.ExBudget
  maxBlockExecutionUnits: pluts.ExBudget
  maxValueSize: number
  collateralPercentage: number
  maxCollateralInputs: number

}

export const protocolParametersOgmios = async (): Promise<ProtocolParameters | null> => {
  const params = {}

  try {
    const accountInfoWS = wsp('queryLedgerState/protocolParameters', params)
    return await new Promise((resolve, reject) => {
      accountInfoWS.onmessage = (e: MessageEvent) => {
        try {
          const results = JSON.parse(e.data)
          console.log('WebSocket message received:', results)
          resolve(results.result) // Type assertion for Utxo array
        } catch (parseError) {
          console.error('Error parsing WebSocket message:', parseError)
          reject(parseError)
        }
      }

      accountInfoWS.onerror = (error: Event) => {
        console.error('WebSocket error:', error)
        reject(error)
      }

      accountInfoWS.onclose = (event: CloseEvent) => {
        console.log('WebSocket connection closed:', event)
        if (!event.wasClean) {
          reject(new Error('WebSocket connection was closed unexpectedly'))
        } else {
          resolve(null) // Connection closed cleanly, but no data received
        }
      }
    })
  } catch (error) {
    console.error('Failed to get account info:', error)
    throw error // Re-throw to be handled by the caller if needed
  }
}

/*
##########################################################################################################
Using current epoch protocol parmaters from Koios API V1 to create a new TxBuilder instance
#############################d############################################################################
*/
export const constructKoiosProtocolParams = async (protocolParamsKoiosRes: any) => {
  const defaultProtocolParameters: any = {
    txFeePerByte: protocolParamsKoiosRes[0].min_fee_a,
    txFeeFixed: protocolParamsKoiosRes[0].min_fee_b,
    maxBlockBodySize: protocolParamsKoiosRes[0].max_block_size,
    maxTxSize: protocolParamsKoiosRes[0].max_tx_size,
    maxBlockHeaderSize: protocolParamsKoiosRes[0].max_bh_size,
    stakeAddressDeposit: Number(protocolParamsKoiosRes[0].key_deposit),
    stakePoolDeposit: Number(protocolParamsKoiosRes[0].pool_deposit),
    poolRetireMaxEpoch: protocolParamsKoiosRes[0].max_epoch,
    stakePoolTargetNum: protocolParamsKoiosRes[0].optimal_pool_count,
    poolPledgeInfluence: protocolParamsKoiosRes[0].influence,
    monetaryExpansion: protocolParamsKoiosRes[0].monetary_expand_rate,
    treasuryCut: protocolParamsKoiosRes[0].treasury_growth_rate,
    protocolVersion: [
      protocolParamsKoiosRes[0].protocol_major,
      protocolParamsKoiosRes[0].protocol_minor
    ],
    minPoolCost: Number(protocolParamsKoiosRes[0].min_pool_cost),
    utxoCostPerByte: Number(protocolParamsKoiosRes[0].coins_per_utxo_size),
    costModels: {
      PlutusScriptV1: protocolParamsKoiosRes[0].cost_models.PlutusV1,
      PlutusScriptV2: protocolParamsKoiosRes[0].cost_models.PlutusV2
    },
    executionUnitPrices: [
      new pluts.CborPositiveRational(protocolParamsKoiosRes[0].price_mem * 10000, 100), // mem
      // protocolParamsKoiosRes[0].price_mem * 100,
      new pluts.CborPositiveRational(protocolParamsKoiosRes[0].price_step * 10000000, 1e5) // cpu
    ],
    maxTxExecutionUnits: new pluts.ExBudget({
      mem: protocolParamsKoiosRes[0].max_tx_ex_mem,
      cpu: protocolParamsKoiosRes[0].max_tx_ex_steps
    }),
    maxBlockExecutionUnits: new pluts.ExBudget({
      mem: protocolParamsKoiosRes[0].max_block_ex_mem,
      cpu: protocolParamsKoiosRes[0].max_block_ex_steps
    }),
    maxValueSize: protocolParamsKoiosRes[0].max_val_size,
    collateralPercentage: protocolParamsKoiosRes[0].collateral_percent,
    maxCollateralInputs: protocolParamsKoiosRes[0].max_collateral_inputs
  }

  return defaultProtocolParameters
}