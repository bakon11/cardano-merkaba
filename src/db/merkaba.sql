-- Wallets Table
CREATE TABLE IF NOT EXISTS wallets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entropyEncrypt TEXT NOT NULL,
  walletPassword TEXT NOT NULL,
  walletID TEXT UNIQUE,
  wallletName TEXT,
);

-- Accounts Table for a specific network
CREATE TABLE IF NOT EXISTS accounts_${network} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  walletID TEXT UNIQUE,
  accountIndex INTEGER NOT NULL,
  accountName TEXT,
  rootXPUB TEXT UNIQUE,
  rootXPRV TEXT,
  accountKeyPub TEXT UNIQUE,
  accountAddressKeyPub TEXT UNIQUE,
  FOREIGN KEY (walletID) REFERENCES wallets(walletID) ON DELETE CASCADE
);

-- Account Addresses Table for a specific network
CREATE TABLE IF NOT EXISTS account_addresses_${network} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  walletID TEXT NOT NULL,
  accountIndex INTEGER NOT NULL,
  addressIndex INTEGER NOT NULL,
  AddressKeyPub TEXT UNIQUE,
  AddressKeyPubHash TEXT,
  AddressKeyPrv TEXT,
  baseAddress_bech32 TEXT,
  baseAddress_hash TEXT,
  stakeAddress_hash TEXT,
  stakeAddress_bech32 TEXT,
  FOREIGN KEY (walletID, accountIndex) REFERENCES accounts_${network}(walletID, accountIndex) ON DELETE CASCADE
);