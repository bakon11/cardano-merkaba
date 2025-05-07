/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateMnemonic, mnemonicToEntropy, validateMnemonic } from 'bip39';
import { XPrv, harden } from '@harmoniclabs/buildooor';
import { Address, StakeAddress, NetworkT } from "@harmoniclabs/cardano-ledger-ts";
import CryptoJS from 'crypto-js';

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
    const validate: boolean = validateMnemonic(seed)
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
    const xprv_root = XPrv.fromEntropy(entropy, '')
  
    // console.log("rootKey", rootKey);
    return xprv_root as XPrv
  } catch (error) {
    console.log('root key error: ', error)
    return 'root key error'
  }
}

export const genAccountPrivatekey = (rootKey: XPrv, index: number) => {
  // hardened derivation
  const accountKey = rootKey
    .derive(harden(1852)) // purpose
    .derive(harden(1815)) // coin type
    .derive(harden(index)) // account #0
  return accountKey
}

export const genAddressPrv = (xprv_root: XPrv, accIndex: number, addressType: number, addressIndex: number) => {
  return xprv_root
  .derive(harden(1852))
  .derive(harden(1815))
  .derive(harden(accIndex))
  .derive(addressType)
  .derive(addressIndex)
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

export const genBaseAddressFromEntropy = ( entropy: string, network: NetworkT, accountIndex: number, addressIndex: number ) => {
  const addressFromEntropy: any = Address.fromEntropy( entropy, network, accountIndex, addressIndex )
  // console.log('addressFromEntropy', addressFromEntropy)

  const baseAddress = new Address({
    network, 
    paymentCreds: addressFromEntropy.paymentCreds, 
    stakeCreds: addressFromEntropy.stakeCreds, 
    type: 'base' 
  })
  // console.log('base address entropy', baseAddress)
  // console.log('base address entropy', baseAddress.toString())
  return baseAddress
}

export const genStakeAddressFromEntropy = ( entropy: string, network: NetworkT, accountIndex: number, addressIndex: number ) => {
  const addressFromEntropy: any = Address.fromEntropy( entropy, network, accountIndex, addressIndex )
  // console.log('addressFromEntropy stake address', addressFromEntropy)

  const stakeAddress = new StakeAddress({
    network, 
    credentials: addressFromEntropy.stakeCreds.hash,
    type: 'stakeKey'
  })
  // console.log('stake address entropy', stakeAddress)
  // console.log('stake address entropy', stakeAddress.toString())
  return stakeAddress
}

export const encrypt = (text: string, passPhrase: string): string => {
  try {
    // Convert the text to UTF-8 bytes before encryption
    const utf8Text = CryptoJS.enc.Utf8.parse(text);
    // Encrypt the text directly
    const encrypted = CryptoJS.AES.encrypt(utf8Text, passPhrase).toString();
    return encrypted;
  } catch (error) {
    console.log('Encryption error:', error);
    return "error"; // Or handle it more gracefully depending on your application needs
  }
}

export const decrypt = (encryptedText: string, passPhrase: string): string => {
  try {
    // Decrypt the encrypted text
    const decrypted = CryptoJS.AES.decrypt(encryptedText, passPhrase);
    // Convert the decrypted bytes to a UTF-8 string
    const originalText = decrypted.toString(CryptoJS.enc.Utf8);
    
    // Check if the decryption resulted in valid UTF-8
    if (originalText === '') {
      // If the result is an empty string, it might indicate an error in decryption
      throw new Error('Decryption failed, possibly due to incorrect passphrase or malformed data');
    }
    
    return originalText;
  } catch (error) {
    console.log('Decryption error:', error);
    return "error"; // Or handle it more gracefully
  }
}

/*
export const xprv_root = XPrv.fromEntropy(
  mnemonicToEntropy(
      process.env.SEED_PHRASE!
  )
);

export const priv0 = (
  xprv_root
  .derive(harden(1852))
  .derive(harden(1815))
  .derive(harden(0))
  .derive(0)
  .derive(0)
);

export const priv1 = (
  xprv_root
  .derive(harden(1852))
  .derive(harden(1815))
  .derive(harden(1))
  .derive(0)
  .derive(0)
);

export const addr0 = Address.fromXPrv( xprv_root, "testnet" );

export const addr1 = Address.testnet(
  Credential.keyHash(
      new PublicKey(
          priv1.public().toPubKeyBytes()
      ).hash
  )
);
*/