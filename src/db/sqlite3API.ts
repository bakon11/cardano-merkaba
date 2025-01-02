/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { networkSelectHook } from '../../hooks/networkSelectHook'

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
    process.exit(1) // Exit with an error code if DB connection fails at startup
  }
}

export const setupTables = async (network = 'preprod') => {
  const db = await initializeDB()
  const walletsColumns =
    'id INTEGER PRIMARY KEY AUTOINCREMENT, entropyEncrypt TEXT NOT NULL, walletID TEXT UNIQUE, walletName TEXT'
  const accountsColumns =
    'id INTEGER PRIMARY KEY AUTOINCREMENT, entropyEncrypt TEXT NOT NULL,  walletPassword TEXT NOT NULL, walletID TEXT UNIQUE'
  const addressesColumns =
    'id INTEGER PRIMARY KEY AUTOINCREMENT, walletID TEXT UNIQUE, accountIndex INTEGER NOT NULL, rootXPUB TEXT UNIQUE, rootXPRV TEXT, accountKeyPub TEXT UNIQUE, accountAddressKeyPub TEXT UNIQUE, FOREIGN KEY (walletID) REFERENCES wallets(walletID) ON DELETE CASCADE'

  const SQLCreateWalletsTBL = `CREATE TABLE IF NOT EXISTS Wallets ( ${walletsColumns}  )`
  const SQLCreateAccountsTBL = `CREATE TABLE IF NOT EXISTS Accounts_${network} ( ${accountsColumns}  )`
  const SQLCreateAccountAddressesTBL = `CREATE TABLE IF NOT EXISTS  Account_Addresses_${network} ( ${addressesColumns}  )`

  await db.run(SQLCreateWalletsTBL)
  await db.run(SQLCreateAccountsTBL)
  await db.run(SQLCreateAccountAddressesTBL)

  return null
}

export const initDB = async () => {
  initializeDB()
    .then(() => setupTables())
    .catch((error) => {
      console.error('Failed to initialize database:', error)
      process.exit(1)
    })
}

export const getWalletDBData = async () => {
  const db = await initializeDB()
  const SQL = `SELECT * FROM wallets`
  const data = await db.all(SQL)
  await db.close()
  return data
}

export const saveNewWallet = async (walletData: any) => {
  const db = await initializeDB()
  const SQLWallet = `INSERT INTO wallets (entropyEncrypt, walletID, wallletName) VALUES (?, ?, ?)`
  const SQLAccount = `INSERT INTO accounts (entropyEncrypt, walletID, accountIndex) VALUES (?, ?, ?)`
  const SQLAddress = `INSERT INTO account_addresses (walletID, accountIndex, addressIndex, baseAddress_bech32, stakeAddress_bech32, createdAt) VALUES (?, ?, ?, ?, ?, ?)`

  await db.run(SQLWallet, [walletData.entropyEncrypt, walletData.walletID, walletData.wallletName])
  await db.close()
  return null
}
