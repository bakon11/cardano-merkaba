-- Wallets Table
CREATE TABLE IF NOT EXISTS wallets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  walletId TEXT NOT NULL,
  entropyEncrypt TEXT NOT NULL,
  walletName TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (walletId)
);

-- Accounts Table for a specific network
CREATE TABLE IF NOT EXISTS accounts_testnet (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  walletId TEXT NOT NULL,
  accountIndex INTEGER NOT NULL,
  accountName TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (walletId) REFERENCES wallets(walletId) ON DELETE CASCADE,
  UNIQUE (walletId, accountIndex)
);

-- Account Addresses Table for a specific network
CREATE TABLE IF NOT EXISTS account_addresses_testnet (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  walletId TEXT NOT NULL,
  accountIndex INTEGER NOT NULL,
  addressIndex INTEGER NOT NULL,
  baseAddress_bech32 TEXT NOT NULL,
  stakeAddress_bech32 TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (walletId, accountIndex) REFERENCES accounts_testnet(walletId, accountIndex) ON DELETE CASCADE,
  UNIQUE (walletId, accountIndex, addressIndex), -- Ensures unique address index per account
  UNIQUE (walletId, accountIndex, baseAddress_bech32), -- Ensures unique base address per account
  UNIQUE (walletId, accountIndex, stakeAddress_bech32) -- Ensures unique stake address per account
);

CREATE TABLE IF NOT EXISTS assets_testnet (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  walletId TEXT NOT NULL,
  accountIndex INTEGER NOT NULL,
  policyId TEXT NOT NULL,
  policyName TEXT NOT NULL,
  assetDecimals INTEGER NOT NULL,
  txHash TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (walletId, accountIndex) REFERENCES accounts_testnet(walletId, accountIndex) ON DELETE CASCADE,
  UNIQUE (walletId, accountIndex, policyId, policyName)
);

-- This SQL will generate DROP TABLE statements for all tables in your SQLite database
SELECT 'DROP TABLE ' || name || ';' FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';
drop table account_addresses_mainnet; drop table accounts_testnet; drop table account_addresses_testnet; drop table wallets; drop table accounts_mainnet; 
drop table assets_testnet; drop table assets_mainnet;
```