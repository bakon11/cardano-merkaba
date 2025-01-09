import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
let db: any = null

export const initializeDB = async () => {
  try {
    db = await open({
      filename: './src/db/merkaba.db',
      driver: sqlite3.Database
    })
    db.configure('busyTimeout', 5000)
    db.exec('PRAGMA foreign_keys = ON')
    db.exec('PRAGMA journal_mode = WAL')
    console.log('Database connection established.')
    return db
  } catch (error) {
    console.error('DB error con:', error)
    // process.exit(1) // Exit with an error code if DB connection fails at startup
  }
}

export const setupWalletTables = async (network = 'testnet') => {
  console.log('Setting up tables for network: ', network)
  const db = await initializeDB()
  const walletsColumns = `
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  walletId TEXT NOT NULL,
  entropyEncrypt TEXT NOT NULL,
  walletName TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (walletId)`
  const accountsColumns = `  
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  walletId TEXT NOT NULL,
  accountIndex INTEGER NOT NULL,
  accountName TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (walletId) REFERENCES wallets(walletId) ON DELETE CASCADE,
  UNIQUE (walletId, accountIndex)`
  const addressesColumns = `
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  walletId TEXT NOT NULL,
  accountIndex INTEGER NOT NULL,
  addressIndex INTEGER NOT NULL,
  baseAddress_bech32 TEXT NOT NULL,
  stakeAddress_bech32 TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (walletId, accountIndex) REFERENCES accounts_${network}(walletId, accountIndex) ON DELETE CASCADE,
  UNIQUE (walletId, accountIndex, addressIndex),
  UNIQUE (walletId, accountIndex, baseAddress_bech32),
  UNIQUE (walletId, accountIndex, stakeAddress_bech32)`

  const SQLCreateWalletsTBL = `CREATE TABLE IF NOT EXISTS wallets ( ${walletsColumns} )`
  const SQLCreateAccountsTBL = `CREATE TABLE IF NOT EXISTS accounts_${network} ( ${accountsColumns} )`
  const SQLCreateAccountAddressesTBL = `CREATE TABLE IF NOT EXISTS account_addresses_${network} ( ${addressesColumns} )`
  try {
    await db.run(SQLCreateWalletsTBL)
    await db.run(SQLCreateAccountsTBL)
    await db.run(SQLCreateAccountAddressesTBL)
    await db.close()
    return null
  } catch (error) {
    console.error('Error creating wallet tables:', error)
    await db.close()
    return 'error'
    // process.exit(1)
  }
}

export const getWalletDBData = async () => {
  let network = localStorage.getItem('networkSelect') || 'testnet'
  console.log('Getitng data from DB for network: ', network)
  const db = await initializeDB()
  const SQL = `
  SELECT 
    w.walletId, 
    w.walletName,
    a.accountName,
    a.accountIndex,
    aa.addressIndex,
    aa.baseAddress_bech32,
    aa.stakeAddress_bech32
  FROM 
    wallets w
  JOIN 
    accounts_testnet a ON w.walletId = a.walletId
  JOIN 
    account_addresses_testnet aa ON a.walletId = aa.walletId AND a.accountIndex = aa.accountIndex
  ORDER BY 
    w.walletName, a.accountName, aa.addressIndex`

  try{
    const data = await db.all(SQL)
    await db.close()
    return data
  }catch(error){
    console.error('Error getting wallet data:', error)
    await db.close()
    return 'error'
  }

}

export const saveNewWallet = async (walletData: any) => {
  const db = await initializeDB()
  console.log('saving walletData', walletData)
  const SQLWallet = `INSERT INTO wallets (entropyEncrypt, walletId, walletName) VALUES ( ?, ?, ? )`
  try {
    await db.run(SQLWallet, [walletData.entropyEncrypt, walletData.walletId, walletData.walletName])
    await db.close()
    return 'ok'
  } catch (error) {
    console.error('Error saving new wallet data:', error)
    await db.close()
    // process.exit(1)
    return 'error'
  }
}

export const saveNewAccount = async (accountData: any) => {
  let network = localStorage.getItem('networkSelect') || 'testnet'
  const db = await initializeDB()
  const SQLAccount = `INSERT INTO  accounts_${network} ( walletId, accountIndex, accountName) VALUES (?, ?, ?)`
  try {
    await db.run(SQLAccount, [
      accountData.walletId,
      accountData.accountIndex,
      accountData.accountName
    ])
    await db.close()
    return 'ok'
  } catch (error) {
    console.error('Error saving new account data:', error)
    await db.close()
    // process.exit(1)
    return 'error'
  }
}

export const saveNewAccountAddress = async (addressData: any) => {
  let network = localStorage.getItem('networkSelect') || 'testnet'
  const db = await initializeDB()
  const SQLAddress = `INSERT INTO account_addresses_${network} (walletId, accountIndex, addressIndex, baseAddress_bech32, stakeAddress_bech32) VALUES (?, ?, ?, ?, ?)`
  try {
    await db.run(SQLAddress, [
      addressData.walletId,
      addressData.accountIndex,
      addressData.addressIndex,
      addressData.baseAddress_bech32,
      addressData.stakeAddress_bech32
    ])
    await db.close()
    return 'ok'
  } catch (error) {
    console.error('Error saving new address data:', error)
    await db.close()
    // process.exit(1)
    return 'error'
  }
}
