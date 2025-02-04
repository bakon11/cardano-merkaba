/* eslint-disable @typescript-eslint/no-explicit-any */
import * as buildooor from '@harmoniclabs/buildooor'
import { splitAsset } from '../../lib/utils'
import { OgmiosUtxoToInputsBuildooor } from '../../API/ogmios'
import { fromHex } from '@harmoniclabs/uint8array-utils'

export const txBuilder_buildooor: any = async (
  protocolParameters: any,
  utxoInputs: any,
  utxoOutputs: any,
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
  const txBuilder = new buildooor.TxBuilder(protocolParameters, buildooor.defaultPreprodGenesisInfos)
  // console.log("txBuilder", txBuilder.protocolParamters);

  /*
  ##########################################################################################################
  Generate inputs
  #############################d############################################################################
  */
  const inputsbuildooor: any = await OgmiosUtxoToInputsBuildooor(utxoInputs)
  console.log('inputsbuildooor', inputsbuildooor)
  // const inputsParsed = inputs.map((utxo: any) => ({ utxo: utxo }))
  // console.log('inputsParsed', inputsParsed)

  /*
  ##########################################################################################################
  Creating outputs for receiving address
  #############################d############################################################################
  */
  // If there is any mints
  let mintOutputs: any = []
  if (mints.length > 0) {
    // console.log('mints', mints)
    // console.log('mintedValue', mintedValue)
    mintOutputs = await mintedTokensOutputs(mintedValue, changeAddress, scriptAddr)
    console.log('mintOutputs', mintOutputs)
  }

  /*
  ##########################################################################################################
  Creating outputs for receiving address
  #############################d############################################################################
  */
  // Simple outputs
  let outputsbuildooor: any = []
  console.log('utxoOutputs', utxoOutputs)
  if (utxoOutputs.length > 0) {
    outputsbuildooor = await createOutputs(utxoOutputs, txBuilder)
    console.log("outputsParsed", outputsbuildooor);
  }

  /*
  ##########################################################################################################
  Attach Metadata to transaction when passed.
  ##########################################################################################################
  */
  const txMeta: any = new buildooor.TxMetadata({
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
  const ttl: any = setTtl(mints)

  /*
  ##########################################################################################################
  Find UTXO for collateral
  #############################d############################################################################
  */
  const utxo = inputsbuildooor.find((u: any) => u.resolved.value.lovelaces > 5_000_000)
  // console.log('colateral', utxo)

  /*
  ##########################################################################################################
  Build Transaction
  #############################d############################################################################
  */
  try {
    let builtTx = txBuilder.buildSync({
      inputs: [ ...inputsbuildooor ],
      collaterals: [utxo],
      collateralReturn: {
          address: utxo.resolved.address,
          value: buildooor.Value.sub(utxo.resolved.value, buildooor.Value.lovelaces(2_000_000))
      },
      invalidBefore: 500000,
      metadata: txMeta,
      mints: mints.length > 0 ? mints : null,
      outputs: [...mintOutputs, ...outputsbuildooor],
      changeAddress
    })
    // Sign tx hash
    const signedTx = accountAddressKeyPrv.sign(builtTx.body.hash.toBuffer())
    // console.log("txBuffer", builtTx.body.hash.toBuffer());

    const VKeyWitness = new buildooor.VKeyWitness(
      new buildooor.VKey(signedTx.pubKey),
      new buildooor.Signature(signedTx.signature)
    )
    // console.log("VKeyWitness", VKeyWitness);
    builtTx.witnesses.addVKeyWitness(VKeyWitness)
    console.log('tx app hash', builtTx.hash.toString())
    console.log('tx app Cbor', builtTx.toCbor().toString())
    console.log('tx app json', builtTx.toJson())
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

const setTtl = async (mints: any) => {
  return mints.length === 0 ? {"invalidAfter": 1000} : null
}
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

/*
#############################################################################################################################
This function will create UTXO outputs meaning sending to someone from following Objectcreated during selection in the wallet
THe below is an example how to pass an aray of UTXO outputs to the function
#############################################################################################################################
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
const createOutputs = async (utxoOutputs: any, txBuilder: any) => {
  let outputsbuildooor: buildooor.TxOut[] = []
  Promise.all(
    await utxoOutputs.map(async (output: any) => {
      outputsbuildooor.push(
        new buildooor.TxOut({
          address: buildooor.Address.fromString(output.address),
          value: await createOutputValues(output, txBuilder) // parse kupo value
          // datum: [], // parse kupo datum
          // refScript: [] // look for ref script if any
        })
      )
    })
  )
  return outputsbuildooor
}

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
