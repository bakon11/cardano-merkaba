/* eslint-disable @typescript-eslint/no-unused-vars */
import * as pluts from '@harmoniclabs/plu-ts'
import { decode } from 'cbor-x'
import { Buffer } from 'node:buffer'
import * as fs from 'node:fs'
// import fetch from 'node-fetch'
// const ogmiosServer = "http://192.168.8.2:1337";
// const kupoServer = "http://192.168.8.3:1442";
//const carpServer = "http://192.168.8.2:3000";
const ogmiosServer = 'https://ogmiosmain.onchainapps.io'
const kupoServer = 'https://kupomain.onchainapps.io'
const carpServer = 'https://carp.onchainapps.io'
const koiosServer = 'https://api.koios.rest/api/v1'
const koiosApiKey = ''

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

/*
##########################################################################################################
Fetching ProtocolParams from Koios API V1
#############################d############################################################################
*/
export const koiosAPI = async (uri: string) => {
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
    const fetchResponse = await fetch(`${koiosServer}/${uri}`, requestOptions)
    const data = await fetchResponse.json()
    // console.log(data);
    return data
  } catch (e) {
    console.log(e)
    return e
  }
}

/*
##########################################################################################################
Fetching UTXO from Kupo API
#############################d############################################################################
*/
export const kupoAPI = async (uri: string) => {
  let settings = {}
  settings = {
    method: 'GET',
    headers: {},
    redirect: 'follow'
  }
  try {
    const fetchResponse = await fetch(`${kupoServer}/${uri}`, settings)
    const data = await fetchResponse.json()
    // console.log(data);
    return data
  } catch (e) {
    console.log(e)
    return e
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

/*
##########################################################################################################
Generate addresses and keys and save them to keys.json.
keys.json needs to have seedphrase and spending password included before hand.
#############################d############################################################################
*/
/*
export const genKeys = async () => {
  let keys = fs.readFileSync("keys.json", "utf8");
  // console.log("keys", keys);
  const seedPhrase = JSON.parse(keys).seedPhrase;
  const walletPassword = JSON.parse(keys).walletPassword;
  // const seedPhrase = await genSeedPhrase();
  // console.log("seedPhrase", seedPhrase);
  const entropy = await seedPhraseToEntropy1(seedPhrase);
  // console.log("entropy", entropy);
  const rootXPRV: any = await genRootPrivateKey1(entropy);
  // console.log("rootXPRV", rootXPRV.to_bech32());
  // console.log("rootXPUB", rootXPRV.to_public().to_bech32());
  console.log("creating wallet/account/address");
  const accountKeyPrv: any = await genAccountKeyPrv(rootXPRV, 1852, 1815, 0);
  // console.log("accountKeyPrv", await encrypt( walletPassword, accountKeyPrv.to_bech32() ));
  // let keyBech = accountKeyPrv.to_bech32();
  // console.log("accountKeyPrv", keyBech.to_raw_key());
  // console.log("accountKeyPub", accountKeyPrv.to_public().to_bech32());
  const accountAddressKeyPrv: any = await genAddressSigningKey(accountKeyPrv, 0);
  // console.log("AccountAddressKeyPrv Key", await encrypt( walletPassword, accountAddressKeyPrv.to_bech32()));
  // console.log("AccountAddressKeyPRV Key", accountAddressKeyPrv.to_bech32());
  // console.log("AccountAddressKeyPUB Key", accountAddressKeyPrv.to_public().to_bech32());
  const accountStakeKeyPrv: any = await genStakeKey(accountKeyPrv, 0);
  // console.log("accountStakeKeyPrv", await encrypt( walletPassword, accountStakeKeyPrv.to_bech32()));
  // console.log("accountStakeKeyPrv", accountStakeKeyPrv.to_bech32());
  // console.log("accountStakeKeyPub", accountStakeKeyPrv.to_public().to_bech32());
  const baseAddress: any = await genBaseAddr(1, accountAddressKeyPrv.to_public(), accountStakeKeyPrv.to_public());
  // console.log("baseAddress", baseAddress.to_address().to_bech32());
  const stakeAddress: any = await genRewardAddr(1, accountStakeKeyPrv.to_public());
  // console.log("stakeAddress", stakeAddress.to_address().to_bech32());
  // create/upgrade the database without version checks
  let newKeys: any = {
    seedPhrase,
    walletPassword,
    walletID: rootXPRV.to_public().to_bech32().slice(100),
    accountIndex: 0,
    // walletName: !walletName ? "wallet " + 0 : walletName,
    rootXPRV: await encrypt(walletPassword, rootXPRV.to_bech32()),
    rootXPUB: rootXPRV.to_public().to_bech32(),
    accountKeyPrv: await encrypt(walletPassword, accountKeyPrv.to_bech32()),
    accountKeyPub: accountAddressKeyPrv.to_public().to_bech32(),
    accountAddressKeyPrv: await encrypt(walletPassword, accountAddressKeyPrv.to_bech32()),
    accountAddressKeyPub: accountAddressKeyPrv.to_public().to_bech32(),
    accountAddressKeyPubHash: toHex(accountAddressKeyPrv.to_public().to_bech32()),
    accountStakeKeyPrv: await encrypt(walletPassword, accountStakeKeyPrv.to_bech32()),
    accountStakeKeyPub: accountStakeKeyPrv.to_public().to_bech32(),
    baseAddress_bech32: baseAddress.to_address().to_bech32(),
    baseAddress_hash: toHex(baseAddress.to_address().to_bytes()),
    stakeAddress: stakeAddress.to_address().to_bech32(),
  };
  console.log("new keys: ", newKeys);
  // fs.writeFileSync("keys.json", JSON.stringify({ ...newKeys }, null, 2));
};
*/
/*
##########################################################################################################
Parse stake address from base address
#############################d############################################################################
*/
/*
export const convertAddressToStake = async (address: string) => {
  // use only if address is hashed
  // const addressBase = CSLwasm.Address.from_bytes(Buffer.from(address, "hex")).to_bech32();
  const stake_cred: any = CSLwasm.BaseAddress?.from_address(CSLwasm.Address.from_bech32(address))?.stake_cred();
  // console.log("stake cred", stake_cred);
  const reward_addr_bytes = new Uint8Array(29);
  reward_addr_bytes.set([0xe1], 0);
  reward_addr_bytes.set(stake_cred.to_bytes().slice(4, 32), 1);
  const reward_addr: any = CSLwasm.RewardAddress.from_address(CSLwasm.Address.from_bytes(reward_addr_bytes));
  // console.log("reward_addr", reward_addr);
  const stake_addr = reward_addr.to_address().to_bech32();
  // console.log("stake_addr", stake_addr);
  const stakePKH = Buffer.from(reward_addr_bytes).toString("hex").slice(2);
  // console.log("stakePKH", stakePKH);
  return stake_addr;
};
*/

/*
##########################################################################################################
DcSPark CarpApi
#############################d############################################################################
*/
export const CarpApi = async (jsonRaw: any) => {
  let settings = {}
  settings = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(jsonRaw),
    redirect: 'follow',
    mode: 'cors'
  }
  try {
    const fetchResponse = await fetch(`${carpServer}/metadata/nft`, settings)
    const data = fetchResponse
    if (data.status === 200) return await data.json()
    // let carpHealth = { connection_status: "disconnected" }
    // sessionStorage.setItem("carpHealth", JSON.stringify(carpHealth));
    // return(JSON.stringify(carpHealth));
  } catch (error) {
    console.log('carp api error', error)
    return 'error'
  }
}

/*
##########################################################################################################
Take CIP25 metadata and convert it to JSON
#############################d############################################################################
*/
export const metadataCbortoJSON = async (cborString: string) => {
  // console.log("cborString", cborString);
  try {
    const metadataJSON = await decode(fromBuffer(cborString))
    // console.log("cborJson", metadataJSON);
    return metadataJSON
  } catch (error) {
    console.log('cborJson Error', error)
    return error
  }
}

/*
##########################################################################################################
Take cardano Policy.Asset and split into two parts
#############################d############################################################################
*/
export const splitAsset = (asset: any) => {
  return asset.split('.')
}

export const fromHexString = (hexString: any) =>
  Uint8Array.from(hexString.match(/.{1,2}/g).map((byte: any) => parseInt(byte, 16)))

export const hex2a = (hexx: any) => {
  const hex = hexx.toString() //force conversion
  let str = ''
  for (let i = 0; i < hex.length; i += 2) str += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
  return str
}

export const a2hex = (ascii: any) => {
  const arr1 = []
  for (let n = 0, l = ascii.length; n < l; n++) {
    const hex = Number(ascii.charCodeAt(n)).toString(16)
    arr1.push(hex)
  }
  return arr1.join('')
}

export const fromBuffer: any = (string: any) => {
  return Buffer.from(string, 'hex')
}

export const toBuffer = (bytes: any) => {
  return Buffer.from(bytes).toString('hex')
}

/*
##########################################################################################################
Take cardano current slot and calculate time left in epoch
#############################d############################################################################
*/
export const calculateEpochTimeLeft = async (data: any) => {
  // console.log("data", data);
  const timeLeftPercent = (data.slotInEpoch / 432000) * 100
  const timeLeftSeconds = 432000 - data.slotInEpoch
  const timeStats = {
    timeLeftPercent,
    timeLeftSeconds,
    timeHuman: seconds_to_days_hours_mins_secs_str(timeLeftSeconds)
  }
  console.log('timeStats', timeStats)
  return timeStats
}

export const seconds_to_days_hours_mins_secs_str = (seconds: any) => {
  // day, h, m and s
  const days = Math.floor(seconds / (24 * 60 * 60))
  seconds -= days * (24 * 60 * 60)
  const hours = Math.floor(seconds / (60 * 60))
  seconds -= hours * (60 * 60)
  const minutes = Math.floor(seconds / 60)
  seconds -= minutes * 60
  return (0 < days ? days + ' days, ' : '') + hours + 'h, ' + minutes + 'm, ' + seconds + 's'
}
