/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateMnemonic, mnemonicToEntropy, validateMnemonic } from 'bip39'
import * as pluts from '@harmoniclabs/plu-ts'
import CryptoJS from 'crypto-js'

export const genSeedPhrase = () => {
  try {
    const mnemonic = generateMnemonic(256)
    // console.log("new mnemonic: " + mnemonic);
    return mnemonic
  } catch (error) {
    console.error(error)
    return error
  }
}

export const validateSeedPhrase = (seed: string) => {
  try {
    const validate = validateMnemonic(seed)
    return validate
  } catch (error) {
    console.log(error)
    return error
  }
}

export const seedPhraseToEntropy = (seed_phrase: any) => {
  return mnemonicToEntropy(seed_phrase)
}

export const genRootPrivateKey = (entropy: any) => {
  try {
    const rootKey = pluts.XPrv.fromEntropy(entropy, '')
    // console.log("rootKey", rootKey);
    return rootKey as pluts.XPrv
  } catch (error) {
    console.log('root key error: ', error)
    return 'root key error'
  }
}

export const genAccountPrivatekey = (rootKey: pluts.XPrv, index: number) => {
  // hardened derivation
  const accountKey = rootKey
    .derive(pluts.harden(1852)) // purpose
    .derive(pluts.harden(1815)) // coin type
    .derive(pluts.harden(index)) // account #0
  return accountKey
}

export const genAddressPrivateKey = (accountKey: any, index: number) => {
  const spendingKey = accountKey
    .derive(0) // 0 external || 1 change || 2 stake key
    .derive(index) // index
  return spendingKey
}

export const genAddressStakeKey = (accountKey: any, index: number) => {
  const spendingKey = accountKey
    .derive(2) // 0 external || 1 change || 2 stake key
    .derive(index) // index
  return spendingKey
}

export const genBaseAddressFromEntropy = (
  entropy: string,
  network: pluts.NetworkT,
  accountIndex: number,
  addressIndex: number
) => {
  const addressFromEntropy: any = pluts.Address.fromEntropy(
    entropy,
    network,
    accountIndex,
    addressIndex
  )
  // console.log('addressFromEntropy', addressFromEntropy)

  const baseAddress = new pluts.Address(
    network,
    addressFromEntropy.paymentCreds,
    addressFromEntropy.stakeCreds,
    'base'
  )
  // console.log('base address entropy', baseAddress)
  // console.log('base address entropy', baseAddress.toString())
  return baseAddress
}

export const genStakeAddressFromEntropy = (
  entropy: string,
  network: pluts.NetworkT,
  accountIndex: number,
  addressIndex: number
) => {
  const addressFromEntropy: any = pluts.Address.fromEntropy(
    entropy,
    network,
    accountIndex,
    addressIndex
  )
  // console.log('addressFromEntropy stake address', addressFromEntropy)

  const stakeAddress = new pluts.StakeAddress(network, addressFromEntropy.stakeCreds.hash)
  // console.log('stake address entropy', stakeAddress)
  // console.log('stake address entropy', stakeAddress.toString())
  return stakeAddress
}

export const encrypt = (passPhrase: string, text: string) => {
  try {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(text), passPhrase).toString()
    return encrypted
  } catch (error) {
    console.log('encrypt error', error)
    return error
  }
}

export const decrypt = (passPhrase: string, text: string) => {
  try {
    const decrypted = CryptoJS.AES.decrypt(text, passPhrase).toString(CryptoJS.enc.Utf8)
    return decrypted
  } catch (error) {
    console.log('decreypt error', error)
    return error
  }
}


//Examples
// export const addr0 = Address.fromXPrv(xprv_root, 'testnet')

//export const addr1 = Address.testnet(
//  Credential.keyHash(new PublicKey(priv1.public().toPubKeyBytes()).hash)
//)
// creates bech32 address from entropy private key
// console.log("prvKey", pluts.Address.fromXPrv(prvKey, network as pluts.NetworkT).toString() )