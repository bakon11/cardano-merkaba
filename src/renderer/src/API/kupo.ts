import * as pluts from '@harmoniclabs/plu-ts'
import {  splitAsset, fromBuffer } from '../lib/utils'

/*
##########################################################################################################
Generate inputs from utxoInputsKupo
#############################d############################################################################
*/
export const paraseKupoUtxoToPluts = async (utxoInputsKupo: any) => {
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
            value: await createInputValuesKupo(utxo)
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
const createInputValuesKupo = async (kupoUtxo: any) => {
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
// console.log("inputsKupoParsed", inputsKupoParsed);
