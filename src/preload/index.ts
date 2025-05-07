import { contextBridge } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import {setupWalletTables, getAllWallets, saveNewWallet, saveNewAccount, saveNewAccountAddress, getWalletEntropy, deleteWallet, saveAsset } from '../db/sqlite3API';
// Use node-fetch for Node.js context
import fetch from 'node-fetch';

// Define fetchMetadata in the preload script
async function fetchMetadata(metadataUrl: string): Promise<any> {
  // Convert IPFS URL to a usable address
  let url = metadataUrl.startsWith('ipfs://')
    ? `https://ipfs.onchainapps.io/ipfs/${metadataUrl.slice(7)}`
    : metadataUrl;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Response:', response);

    if (!response.ok && response.status !== 200) {
      console.warn('Failed to fetch metadata:', response.statusText);
      return {};
    }

    const jsonData = await response.json();
    console.log('Metadata fetched:', jsonData);
    return jsonData;
  } catch (error) {
    console.error('Fetch error:', error);
    return {};
  }
}

// Custom APIs for renderer
const api = {
  setupWalletTables: setupWalletTables,
  getAllWallets: getAllWallets,
  saveNewWallet: saveNewWallet,
  saveNewAccount: saveNewAccount,
  saveNewAccountAddress: saveNewAccountAddress,
  getWalletEntropy: getWalletEntropy,
  deleteWallet: deleteWallet,
  saveAsset:saveAsset,
  fetchMetadata:fetchMetadata
}
// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

