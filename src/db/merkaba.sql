-- Wallets Table
CREATE TABLE IF NOT EXISTS wallets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entropyEncrypt TEXT NOT NULL,
  walletName TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounts Table for a specific network
CREATE TABLE IF NOT EXISTS accounts_${network} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  walletName TEXT NOT NULL,
  accountIndex INTEGER NOT NULL,
  accountName TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (walletName) REFERENCES wallets(walletName) ON DELETE CASCADE,
  UNIQUE (walletName, accountIndex), -- Ensures accountIndex is unique per walletName
  UNIQUE (walletName, accountName)  -- Ensures accountName is unique per wallet
);

-- Account Addresses Table for a specific network
CREATE TABLE IF NOT EXISTS account_addresses_${network} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  walletName TEXT NOT NULL,
  accountIndex INTEGER NOT NULL,
  addressIndex INTEGER NOT NULL,
  baseAddress_bech32 TEXT,
  stakeAddress_bech32 TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (walletName, accountIndex) REFERENCES accounts_${network}(walletName, accountIndex) ON DELETE CASCADE,
  UNIQUE (walletName, addressIndex, baseAddress_bech32, stakeAddress_bech32)
);

-- This SQL will generate DROP TABLE statements for all tables in your SQLite database
SELECT 'DROP TABLE IF EXISTS ' || name || ';' FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';