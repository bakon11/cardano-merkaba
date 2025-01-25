/* eslint-disable @typescript-eslint/no-explicit-any */
// import { TxBuilder, Address, Hash28, Hash, UTxO, Value, TxOut, VKeyWitness, VKey } from "@harmoniclabs/plu-ts";
import * as pluts from '@harmoniclabs/plu-ts'
import { splitAsset, fromBuffer } from '../../../lib/utils'
import { createInputValuesOgmios } from '../../../API/ogmios'

export const txBuilder_PLUTS: any = async (
  protocolParameters: any,
  utxoInputs: any,
  utxoOutputs: any,
  changeAddress: any,
  accountAddressKeyPrv: any,
  metadata: any
) => {
  // console.log(protocolParameters);
  // console.log(utxoInputs[0].value);
  // console.log(utxoInputsCBOR);
  // console.log(utxoOutputs);
  // console.log(changeAddress);

  /*
  ##########################################################################################################
  Constructing TxBuilder instance
  #############################d############################################################################
  */
  const txBuilder = new pluts.TxBuilder(protocolParameters)
  // console.log("txBuilder", txBuilder.protocolParamters);

  /*
  ##########################################################################################################
  Constructing UTxO instances from CBORs gathered through CIP30 getUtxos() method
  #############################d############################################################################
  */
  // const inputsCbor: any = utxoInputsCBOR.map(pluts.UTxO.fromCbor) // UTxO[]
  // console.log("inputs", inputsCbor);
  // const inputsCborParsed = inputsCbor.map((utxo: any) => ({ utxo: utxo }))
  // console.log("inputsCborParsed", inputsCborParsed[1].utxo.resolved.value.lovelaces);

  /*
  ##########################################################################################################
  Generate inputs from utxoInputsKupo
  #############################d############################################################################
  */
  // utxoInputsKupo = await selectInputs(utxoInputsKupo, utxoOutputs)
  let inputs: any = []

  Promise.all(
    await utxoInputs.map(async (utxo: any) => {
      // console.log("adding inputs")
      inputs.push(
        new pluts.UTxO({
          utxoRef: {
            id: utxo.transaction.id,
            index: utxo.index
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

  console.log('inputs', inputs)
  const inputsParsed = inputs.map((utxo: any) => ({ utxo: utxo }))
  console.log('inputsParsed', inputsParsed)

  /*
  ##########################################################################################################
  Creating outputs for receiving address
  #############################d############################################################################
  */
  let outputsParsed: pluts.TxOut[] = []
  Promise.all(
    await utxoOutputs.map(async (output: any) => {
      outputsParsed.push(
        new pluts.TxOut({
          address: pluts.Address.fromString(output.address),
          value: await createOutputValues(output, txBuilder) // parse kupo value
          // datum: [], // parse kupo datum
          // refScript: [] // look for ref script if any
        })
      )
    })
  )
  // console.log("outputsParsed", outputsParsed);

  /*
    ##########################################################################################################
    Attach Metadata to transaction when passed.
    ##########################################################################################################
  */
  const txMeta: any = new pluts.TxMetadata({
    [metadata.label]: pluts.jsonToMetadata(metadata.properties)
  })
  // console.log("txMeta", txMeta);

  // const stakeCred = accountAddressKeyPrv
  // console.log("stakeCred", stakeCred);
  // const delegateCerts = new pluts.Certificate(pluts.CertificateType.StakeDelegation, accountAddressKeyPrv.stake_cred(), 0);

  /*
  ##########################################################################################################
  Transaction time to live till after slot?
  #############################d############################################################################
  */
  const ttl = 500000000

  /*
  ##########################################################################################################
  Build Transaction
  #############################d############################################################################
  */
  try {
    let builtTx = txBuilder.buildSync({
      inputs: inputsParsed,
      changeAddress,
      outputs: outputsParsed,
      invalidAfter: ttl,
      metadata: txMeta
    })
    // Sign tx hash
    const signedTx = accountAddressKeyPrv.sign(builtTx.body.hash.toBuffer())
    // console.log("txBuffer", builtTx.body.hash.toBuffer());

    const VKeyWitness = new pluts.VKeyWitness(
      new pluts.VKey(signedTx.pubKey),
      new pluts.Signature(signedTx.signature)
    )
    // console.log("VKeyWitness", VKeyWitness);
    builtTx.witnesses.addVKeyWitness(VKeyWitness)
    const txCBOR = builtTx.toCbor().toString()
    const txHash = builtTx.hash.toString()
    // console.log('builtTx', builtTx)
    // console.log('txCBOR', txCBOR)
    // console.log("builtTx hash: ", builtTx.hash);
    // console.log('builtTx complete: ', builtTx.isComplete)
    // console.log('bytes', hexToBytes(txCBOR))
    return builtTx
  } catch (error) {
    console.log('txBuilder.buildSync', error)
    return 'tx error: ' + error
  }
}

/*
##########################################################################################################
Helper Functions
#############################d############################################################################
*/
// Function to convert hex string to byte array using slice
export function hexToBytes(hex: string): number[] {
  let bytes: number[] = [];
  for (let c = 0; c < hex.length; c += 2) {
      bytes.push(parseInt(hex.slice(c, c + 2), 16));
  }
  return bytes;
}

/*
##########################################################################################################
This function will create UTXO outputs meaning sending to someone from following Objectcreated during selection in the wallet
{
  address: "addr1q9shhjkju8aw2fpt4ttdnzrqcdacaegpglfezen33kq9l2wcdqua0w5yj7d8thpulynjly2yrhwxvdhtrxqjpmy60uqs4h7cyp",
  value: {
    coins: 1000000,
    assets: {
      "b88d9fe270b184cf02c99b19ffa5ab0181daeff00c52811c6511c12a.4d65726b616261232d33": 1,
      "b88d9fe270b184cf02c99b19ffa5ab0181daeff00c52811c6511c12a.4d65726b616261232d32": 1,
      "b812d5a466604bcc25d2313183c387cebf52302738b5a178daf146f0.4d616e64616c612332": 1,
      "b812d5a466604bcc25d2313183c387cebf52302738b5a178daf146f0.4d616e64616c612331": 1
    }
  }
}
#############################d############################################################################
*/

const createOutputValues = async (output: any, txBuilder: any) => {
  // console.log("output", output);
  let outputAssets: any = []
  Promise.all(
    Object.entries(output.value).map(([key, value]: any) => {
      // console.log("key", key);
      // console.log("value", value);
      key === 'coins' && outputAssets.push(pluts.Value.lovelaces(value))
      key === 'assets' &&
        Object.entries(value).length > 0 &&
        Object.entries(value).map(([asset, quantity]: any) => {
          let assetNew = pluts.Value.singleAsset(
            new pluts.Hash28(splitAsset(asset)[0]),
            fromBuffer(splitAsset(asset)[1]),
            quantity
          )
          outputAssets.push(assetNew)
        })
    })
  )
  let outputParsed = outputAssets.reduce(pluts.Value.add)
  // console.log('outputParsed', outputParsed.toCbor().toString())
  const minUtxo = txBuilder.getMinimumOutputLovelaces(outputParsed.toCbor().toString())
  console.log('minUtxo', Number(minUtxo))

  outputAssets = []
  Promise.all(
    Object.entries(output.value).map(([key, value]: any) => {
      // console.log("key", key);
      // console.log("value", value);
      key === 'coins' && outputAssets.push(pluts.Value.lovelaces(value + Number(minUtxo)))
      key === 'assets' &&
        Object.entries(value).length > 0 &&
        Object.entries(value).map(([asset, quantity]: any) => {
          let assetNew = pluts.Value.singleAsset(
            new pluts.Hash28(splitAsset(asset)[0]),
            fromBuffer(splitAsset(asset)[1]),
            quantity
          )
          outputAssets.push(assetNew)
        })
    })
  )
  outputParsed = outputAssets.reduce(pluts.Value.add)
  // console.log('outputParsed', outputParsed.toCbor().toString())
  return outputParsed
}
