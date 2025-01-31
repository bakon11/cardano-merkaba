/* eslint-disable @typescript-eslint/no-explicit-any */
import * as buildooor from '@harmoniclabs/buildooor'
import { splitAsset } from '../../lib/utils'
import { createInputValuesOgmios } from '../../API/ogmios'
import { fromHex } from '@harmoniclabs/uint8array-utils'

export const txBuilderMint: any = async (
  protocolParameters: any,
  utxoInputs: any,
  changeAddress: any,
  accountAddressKeyPrv: any,
  metadata: any,
  script: any,
  scriptAddr: any,
  mints: any,
  mintedValue: any
) => {
  /*
  ##########################################################################################################
  Constructing TxBuilder instance
  #############################d############################################################################
  */

  const txBuilder = new buildooor.TxBuilder(protocolParameters)
  console.log('txBuilder protocolParamters', txBuilder)

  /*
  ##########################################################################################################
  Constructing UTxO instances from CBORs gathered through CIP30 getUtxos() method
  #############################d############################################################################
  */
  // const inputsCbor: any = utxoInputsCBOR.map(buildooor.UTxO.fromCbor) // UTxO[]
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
        new buildooor.UTxO({
          utxoRef: {
            id: utxo.transaction.id,
            index: utxo.index
          },
          resolved: {
            address: buildooor.Address.fromString(utxo.address),
            value: await createInputValuesOgmios(utxo)
            // datum: [], // parse kupo datum
            // refScript: [] // look for ref script if any
          }
        })
      )
      // console.log("address used", buildooor.Address.fromString(utxo.address).paymentCreds)
    })
  )

  console.log('inputs', inputs)
  // const inputsParsed = inputs.map((utxo: any) => ({ utxo: utxo }))
  // console.log('inputsParsed', inputsParsed)

  /*
  ##########################################################################################################
  Creating outputs for receiving address
  #############################d############################################################################
  */
  const mintOutputs: any = await mintedTokensOutputs(mintedValue, changeAddress, scriptAddr)
  console.log('mintOutputs', mintOutputs)

  /*
  let outputsParsed: buildooor.TxOut[] = []
  Promise.all(
    await utxoOutputs.map(async (output: any) => {
      outputsParsed.push(
        new buildooor.TxOut({
          address: buildooor.Address.fromString(output.address),
          value: await createOutputValues(output, txBuilder) // parse kupo value
          // datum: [], // parse kupo datum
          // refScript: [] // look for ref script if any
        })
      )
    })
  )
  */
  // console.log("outputsParsed", outputsParsed);

  /*
    ##########################################################################################################
    Attach Metadata to transaction when passed.
    ##########################################################################################################
  */
  const txMeta: any = new buildooor.TxMetadata({
    [metadata.label]: buildooor.jsonToMetadata(metadata.properties),
    [metadata.label]: buildooor.jsonToMetadata(metadata.properties)
  })
  // console.log("txMeta", txMeta);

  // const stakeCred = accountAddressKeyPrv
  // console.log("stakeCred", stakeCred);
  // const delegateCerts = new buildooor.Certificate(buildooor.CertificateType.StakeDelegation, accountAddressKeyPrv.stake_cred(), 0);

  /*
  ##########################################################################################################
  Transaction time to live till after slot?
  #############################d############################################################################
  */
  const ttl = 500000000

  /*
  ##########################################################################################################
  Find UTXO for collateral
  #############################d############################################################################
  */
  const colateral = inputs.find((u) => u.resolved.value.lovelaces > 15_000_000)
  console.log('colateral', colateral)

  /*
  ##########################################################################################################
  Build Transaction
  #############################d############################################################################
  */
  // console.log('address from strng', buildooor.Address.fromString(changeAddress))
  try {
    let builtTx = txBuilder.buildSync({
      inputs: inputs,
      collaterals: [colateral],
      collateralReturn: {
         address: colateral.resolved.address,
         value: buildooor.Value.sub(colateral.resolved.value, buildooor.Value.lovelaces(2_000_000))
      },
      // invalidAfter: ttl,
      metadata: txMeta,
      mints: mints,
      outputs: mintOutputs,
      changeAddress
    })
    // Sign tx hash
    const signedTx = accountAddressKeyPrv.sign(builtTx.body.hash.toBuffer())
    const VKeyWitness = new buildooor.VKeyWitness(
      new buildooor.VKey(signedTx.pubKey),
      new buildooor.Signature(signedTx.signature)
    )
    builtTx.witnesses.addVKeyWitness(VKeyWitness)
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

//this function adds outputs for minted tokens
const mintedTokensOutputs = async (mintedValue: any, changeAddress: string, scriptAddr: any) => {
  let mintOutputs: any[] = []
  // console.log('mintedValue', mintedValue.toJson())
  Promise.all(
    Object.entries(mintedValue.toJson()).map(([policyId, assets]: any) => {
      // policyId !== '' && console.log('policyId', fromHex(policyId))
      // policyId !== '' && console.log('assets', assets)
      policyId !== '' &&
        Object.entries(assets).map(([assetName, quantity]: any) => {
          // policyId !== '' && console.log('policyId', scriptAddr.paymentCreds.hash)
          // assetName !== '' && console.log('assetName', assetName)
          // assetName !== '' && console.log('quantity', quantity)
          assetName !== '' &&
            mintOutputs.push({
              address: changeAddress,
              value: buildooor.Value.add(
                buildooor.Value.lovelaces(5_000_000),
                buildooor.Value.singleAsset(
                  scriptAddr.paymentCreds.hash,
                  fromHex(assetName),
                  quantity
                )
              )
            })
        })
    })
  )
  return mintOutputs
}

// Function to converSome outputs have an insufficient amount of Ada attached to them. In fact, any new output created in a system must pay for the resources it occupies. Because user-created assets are worthless (from the point of view of the protocol), those resources must be paid in the form of a Ada deposit. The exact depends on the size of the serialized output: the more assets, the higher the amount. The field 'data.insufficientlyFundedOutputs.[].output' contains a list of all transaction outputs that are insufficiently funded. Starting from the Babbage era, the field 'data.insufficientlyFundedOutputs.[].minimumRequiredValue' indicates the required amount of Lovelace (1e6 Lovelace = 1 Ada) needed for each output.t hex string to byte array using slice
export function hexToBytes(hex: string): number[] {
  let bytes: number[] = []
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.slice(c, c + 2), 16))
  }
  return bytes
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
      key === 'coins' && outputAssets.push(buildooor.Value.lovelaces(value))
      key === 'assets' &&
        Object.entries(value).length > 0 &&
        Object.entries(value).map(([asset, quantity]: any) => {
          let assetNew = buildooor.Value.singleAsset(
            new buildooor.Hash28(splitAsset(asset)[0]),
            fromHex(splitAsset(asset)[1]),
            quantity
          )
          outputAssets.push(assetNew)
        })
    })
  )
  let outputParsed = outputAssets.reduce(buildooor.Value.add)
  // console.log('outputParsed', outputParsed.toCbor().toString())
  const minUtxo = txBuilder.getMinimumOutputLovelaces(outputParsed.toCbor().toString())
  console.log('minUtxo', Number(minUtxo))

  outputAssets = []
  Promise.all(
    Object.entries(output.value).map(([key, value]: any) => {
      // console.log("key", key);
      // console.log("value", value);
      key === 'coins' && outputAssets.push(buildooor.Value.lovelaces(value + Number(minUtxo)))
      key === 'assets' &&
        Object.entries(value).length > 0 &&
        Object.entries(value).map(([asset, quantity]: any) => {
          let assetNew = buildooor.Value.singleAsset(
            new buildooor.Hash28(splitAsset(asset)[0]),
            fromHex(splitAsset(asset)[1]),
            quantity
          )
          outputAssets.push(assetNew)
        })
    })
  )
  outputParsed = outputAssets.reduce(buildooor.Value.add)
  // console.log('outputParsed', outputParsed.toCbor().toString())
  return outputParsed
}
