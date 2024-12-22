/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'node:fs'
import {
  koiosAPI,
  kupoAPI,
  genKeys,
  a2hex,
  splitAsset,
  fromHexString,
  fromBuffer,
  toBuffer,
  hex2a,
  constructKoiosProtocolParams,
  ogmiosHealth
} from './utils.ts'
import {
  genSeedPhrase,
  seedPhraseToEntropy,
  genRootPrivateKey,
  genAccountPrivatekey,
  genAddressPrivatekey
} from './cryptoPLUTS.ts'
import { txBuilder_PLUTS } from './txbuilder_PLUTS.ts'
import * as pluts from '@harmoniclabs/plu-ts'
import { blake2b_224 } from '@harmoniclabs/crypto'
import * as plutsBip from '@harmoniclabs/bip32_ed25519'
import { decrypt } from './cryptoPLUTS.ts'

const buildTx = async () => {
  /*
  ##########################################################################################################
  Keys.json file contianing all addresses and encrypted private keys, created with the genKeys() function.
  Look at example keysExample.json file
  #############################d############################################################################
  */
  let keys = fs.readFileSync('keys.json', 'utf8')

  /*
  ##########################################################################################################
  Fetching ProtocolParams from Koios API V1
  #############################d############################################################################
  */
  const protocolParamsKoiosRes = await koiosAPI('epoch_params')
  // console.log("protocolParamsKoiosRes", protocolParamsKoiosRes[0]);

  /*
  ##########################################################################################################
  Parse PraotocolParams from Ogmios
  #############################d############################################################################
  */
  // const ogmiosHealthRes = await ogmiosHealth();
  // console.log("ogmiosHealthRes", ogmiosHealthRes);

  /*
  ##########################################################################################################
  Parse PraotocolParams from Koios API V1
  #############################d############################################################################
  */
  const defaultProtocolParameters = await constructKoiosProtocolParams(protocolParamsKoiosRes)
  // console.log("defaultProtocolParameters", defaultProtocolParameters);

  /*
  ##########################################################################################################
  CIP30 getUtxos() method CBORs example for now.
  ##########################################################################################################
  */
  let cborInputs: any = []

  /*
  ##########################################################################################################
  Use when using UTXO info from other sources like Kupo indexer or BLockfrost
  #############################d############################################################################
  */
  let kupoInputs: any = await kupoAPI(`matches/${JSON.parse(keys).baseAddress_bech32}?unspent`)
  // console.log("kupoInputs", kupoInputs);

  /*
  ##########################################################################################################
  Change address: address that will receive whats left over from spent UTXOS.
  #############################d############################################################################
  */
  const changeAddress = JSON.parse(keys).baseAddress_bech32
  // console.log("changeAddress", changeAddress);

  /*
  ##########################################################################################################
  Output utxos
  #############################d############################################################################
  */
  const utxoOutputs = [
    {
      address:
        'addr1q9shhjkju8aw2fpt4ttdnzrqcdacaegpglfezen33kq9l2wcdqua0w5yj7d8thpulynjly2yrhwxvdhtrxqjpmy60uqs4h7cyp',
      value: {
        coins: 1000000,
        assets: {
          'b88d9fe270b184cf02c99b19ffa5ab0181daeff00c52811c6511c12a.4d65726b616261232d33': 1,
          'b88d9fe270b184cf02c99b19ffa5ab0181daeff00c52811c6511c12a.4d65726b616261232d32': 1,
          'b88d9fe270b184cf02c99b19ffa5ab0181daeff00c52811c6511c12a.4d65726b616261232d31': 1,
          'b812d5a466604bcc25d2313183c387cebf52302738b5a178daf146f0.4d616e64616c612332': 1,
          'b812d5a466604bcc25d2313183c387cebf52302738b5a178daf146f0.4d616e64616c612331': 1,
          'b812d5a466604bcc25d2313183c387cebf52302738b5a178daf146f0.4d616e64616c612333': 1,
          'b812d5a466604bcc25d2313183c387cebf52302738b5a178daf146f0.4d616e64616c612334': 1
        }
      }
    },
    {
      address:
        'addr1q9shhjkju8aw2fpt4ttdnzrqcdacaegpglfezen33kq9l2wcdqua0w5yj7d8thpulynjly2yrhwxvdhtrxqjpmy60uqs4h7cyp',
      value: {
        coins: 1000000,
        assets: {}
      }
    }
  ]

  /*
  ##########################################################################################################
  Metadata to include with teh TX.
  #############################d############################################################################
  */
  const metadata = {
    label: 420,
    properties: {
      type: 'mandala_rewards_despensing',
      message: 'Another sovereing has claimed their story.',
      website: 'https://www.enterthemandala.com/',
      message2: 'TX Crafted With PLU-TS'
    }
  }

  /*
  ##########################################################################################################
  For example purposes will regenerate keys from seed and entropy contained in the keys.json file.
  (check keys.json.ecample file for reference)
  However this is not secure and will be corrected in the future.
  #############################d############################################################################
  */

  const entropyDecrypt: any = await decrypt(
    JSON.parse(keys).walletPassword,
    JSON.parse(keys).entropyEncrypt
  )
  // console.log("entropyDecrypted", entropyDecrypt);
  const entropy = JSON.parse(entropyDecrypt)

  console.log('#################################################################')

  const rootKey: plutsBip.XPrv | undefined = await genRootPrivateKey(fromBuffer(entropy))
  // console.log("rootKey  plu-ts: ",  rootKey?.bytes);
  // const rootKey1 = await genRootPrivateKey1(entropy1);
  // console.log("rootKey  CML: ", rootKey1.as_bytes());
  // const rootKey3 = await genRootPrivateKey3(entropy3);
  // console.log("rootKey  test: ", rootKey3);

  // console.log("#################################################################")

  const accountKeyPrv = await genAccountPrivatekey(rootKey as plutsBip.XPrv, 0)
  // console.log("accountKeyPrv plu-ts", accountKeyPrv);
  // const accountKeyPrvCML = await genAccountKeyPrv(rootKey1, 1852, 1815, 0);
  // console.log("accountKey CML", accountKeyPrvCML);

  // console.log("#################################################################")

  const accountAddressKeyPrv = await genAddressPrivatekey(accountKeyPrv, 0, 0)
  // console.log("addressKey Prv pluts: ", plutsBip.XPrv.fromBytes(accountAddressKeyPrv.bytes));
  // console.log("addressKey Prv pluts: ", accountAddressKeyPrv);
  // console.log("accountAddressKeyPrv: ", blake2b_224((accountAddressKeyPrv.bytes)));
  const accountAddressKeyPub = accountAddressKeyPrv.public()
  console.log('accountAddressKeyPub: ', toBuffer(accountAddressKeyPub.bytes))
  console.log(
    'accountAddress Key Hash from @harmoniclabs/bip32_ed25519 ',
    toBuffer(blake2b_224(accountAddressKeyPub.toPubKeyBytes()))
  )
  const addr: any = pluts.Address.fromXPrv(accountAddressKeyPrv, 'mainnet')
  console.log('address: ', addr.paymentCreds.hash.toString())
  const baseAddress = pluts.Address.fromBytes(addr.paymentCreds.hash)
  console.log('Base Address', baseAddress)
  // const baseAddress = pluts.Address.fromBytes(accountAddressKeyPub).toString();
  // console.log("baseAddress: ", baseAddress);
  // console.log("input address hash", pluts.Address.fromString(inputAddress).paymentCreds.hash.toString())
  // const addressKeyPrvCML = await genAddressSigningKey(accountKeyPrvCML, 0);
  // console.log("addressKey prv CML: ", addressKeyPrvCML.as_bytes());

  // console.log("#################################################################")

  // console.log("accountAddress Key Hash from", toBuffer(addressKeyPrvCML.to_public().to_raw_key().hash().to_bytes()));

  // await txBuilder_PLUTS(defaultProtocolParameters, kupoInputs, cborInputs, utxoOutputs, changeAddress, accountAddressKeyPrv, metadata);
}

buildTx()

// genKeys();
