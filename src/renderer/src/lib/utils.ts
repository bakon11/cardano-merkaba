/*
##########################################################################################################
Take cardano Policy.Asset and split into two parts
#############################d############################################################################
*/
export const splitAsset = (asset: any) => {
  return asset.split('.')
}

/* 
----------------------------------------------------------------------------  
Fetches metadata from IPFS or HTTP specified in onchain proposal
----------------------------------------------------------------------------  
*/
export async function fetchMetadata(metadataUrl: string): Promise<any> {
  // Convert IPFS URL to a usable address
  let url = metadataUrl.startsWith('ipfs://')
    ? `https://ipfs.onchainapps.io/ipfs/${metadataUrl.slice(7)}`
    : metadataUrl;

  // Define a CORS proxy fallback
  const corsProxy = 'https://cors-anywhere.herokuapp.com/';
  let attemptWithProxy = false;

  const tryFetch = async (fetchUrl: string) => {
    try {
      const response = await fetch(fetchUrl, {
        mode: 'cors', // Explicitly set CORS mode
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
      if (error instanceof TypeError && error.message.includes('Failed to fetch') && !attemptWithProxy) {
        // Likely a CORS issue, try with proxy
        console.warn('Retrying with CORS proxy...');
        attemptWithProxy = true;
        return tryFetch(`${corsProxy}${fetchUrl}`);
      }
      return {};
    }
  };

  return tryFetch(url);
}