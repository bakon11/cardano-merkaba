import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api:  {
      initDB: () => any; // Define more specifically if possible
      getWalletDBData: () => any; // Define more specifically if possible
      saveNewWallet: () => any; // Define more specifically if possible
    }
  }
}
