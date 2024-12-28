/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateMnemonic, mnemonicToEntropy, validateMnemonic } from 'bip39'
import { harden, XPrv } from '@harmoniclabs/plu-ts'
import CryptoJS from 'crypto-js'

export const genSeedPhrase = async () => {
  try {
    const mnemonic = generateMnemonic(256)
    // console.log("new mnemonic: " + mnemonic);
    return mnemonic
  } catch (error) {
    console.error(error)
    return error
  }
}

export const validateSeedPhrase = async (seed: string) => {
  try {
    const validate = validateMnemonic(seed)
    return validate
  } catch (error) {
    console.log(error)
    return error
  }
}

export const seedPhraseToEntropy = async (seed_phrase: any) => {
  return mnemonicToEntropy(seed_phrase)
}

export const genRootPrivateKey = async (entropy: any) => {
  try {
    const rootKey = XPrv.fromEntropy(Buffer.from(entropy, 'hex'), Buffer.from(''))
    // console.log("rootKey", rootKey);
    return rootKey
  } catch (error) {
    console.log('root key error: ', error)
    return 'root key error'
  }
}

export const genAccountPrivatekey = async (rootKey: XPrv, index: number) => {
  // hardened derivation
  const accountKey = rootKey
    .derive(harden(1852)) // purpose
    .derive(harden(1815)) // coin type
    .derive(harden(index)) // account #0
  return accountKey
}

export const genAddressPrivateKey = async (accountKey: any, index: number) => {
  const spendingKey = accountKey
    .derive(0) // 0 external || 1 change || 2 stake key
    .derive(index) // index
  return spendingKey
}

export const genAddressStakeKey = async (accountKey: any, index: number) => {
  const spendingKey = accountKey
    .derive(2) // 0 external || 1 change || 2 stake key
    .derive(index) // index
  return spendingKey
}

// export const addr0 = Address.fromXPrv(xprv_root, 'testnet')

//export const addr1 = Address.testnet(
//  Credential.keyHash(new PublicKey(priv1.public().toPubKeyBytes()).hash)
//)

export const encrypt = async (passPhrase: string, text: string) => {
  try {
    const encrypted = await CryptoJS.AES.encrypt(JSON.stringify(text), passPhrase).toString()
    return encrypted
  } catch (error) {
    console.log('encrypt error', error)
    return error
  }
}

export const decrypt = async (passPhrase: string, text: string) => {
  try {
    const decrypted = await CryptoJS.AES.decrypt(text, passPhrase).toString(CryptoJS.enc.Utf8)
    return decrypted
  } catch (error) {
    console.log('decreypt error', error)
    return error
  }
}
