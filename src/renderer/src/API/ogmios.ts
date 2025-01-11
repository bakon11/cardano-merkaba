import { w3cwebsocket as W3CWebSocket } from 'websocket'
import * as pluts from '@harmoniclabs/plu-ts'
import { splitAsset, fromBuffer } from '../lib/utils'
import { OgmiosUtxos } from './utxosExample/'

interface OgmiosRequest {
  jsonrpc: string
  method: string
  params: object
  id: string
}

export const wsp = (method: string, params: object): any => {
  // Retrieve the Ogmios hook from localStorage or set a default value
  let ogmiosHook = localStorage.getItem('ogmiosHook') || 'ws://192.168.1.247:1337'
  // Initialize WebSocket connection
  const OgmiosWS = new W3CWebSocket(ogmiosHook)

  OgmiosWS.onopen = () => {
    console.log('Ogmios Connection opened')
    sessionStorage.setItem('ogmiosHealth', 'connected')

    // Prepare the message to be sent
    const message: OgmiosRequest = {
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: 'init-1234-5678'
    }

    try {
      OgmiosWS.send(JSON.stringify(message))
    } catch (error) {
      console.error('Ogmios WS error on sending message: ', error)
      sessionStorage.setItem('ogmiosHealth', 'error')
      // Here, we're not returning because this is an event handler, not a function call
    }
  }

  OgmiosWS.onerror = (error: Event) => {
    console.error('Ogmios Connection Error:', error)
    sessionStorage.setItem('ogmiosHealth', 'error')
  }

  OgmiosWS.onclose = (event: CloseEvent) => {
    console.log('Ogmios Connection closed:', event)
    sessionStorage.setItem('ogmiosHealth', 'closed')
  }

  // Return the WebSocket instance for further use if needed
  return OgmiosWS
}

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
export const parseOgmiosUtxosForWallet = (utxos: Utxo[]): Result => {
  utxos = OgmiosUtxos
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
Generate inputs from utxoInputsKupo
#############################d############################################################################
*/
export const paraseOgmiosUtxoToPlutsTX = async (utxoInputsKupo: any) => {
  let inputs: any = []
  Promise.all(
    await utxoInputsKupo.map(async (utxo: any) => {
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
##########################################################################################################
This function will create UTXO input values like: UTXO lovelaces and UTXO assets for PLU-TS
#############################d############################################################################
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
