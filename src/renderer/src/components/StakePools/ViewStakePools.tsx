import * as React from 'react';
import { Sheet, Typography, Input } from '@mui/joy';
import { getStakePools } from '../../API/ogmios';
import { fetchMetadata } from '../../lib/utils';
import { set } from 'ace-builds-internal/config';


interface Pool {
    poolId: string
    poolData: Object
  }

export const ViewStakePools = () => {
  const fetchMetadata = (metadataURL: string): Promise<any> => window.api.fetchMetadata(metadataURL);
    const [ searchTerm, setSearchTerm ] = React.useState<string>('');
    const [ stakePools, setStakePools ] = React.useState<object>({});
    const [ filteredPools, setFilteredPools ] = React.useState<Pool[]>([]);    
    
    
    const filterStakePools = async ( term: string ) => {        
    }

    const fetchStakePools = async () => {
        const stakePoolsRes = await getStakePools();
        console.log('stakePoolsRes', stakePoolsRes);
        const parsePoolsRes = await parsePools(stakePoolsRes);
        setStakePools(parsePoolsRes);
        console.log('parsePoolsRes', parsePoolsRes);
    };

    const parsePools = async (stakePools: any) => {
      const flatPools: Pool[] = await Promise.all(
        Object.entries(stakePools).map(async ([poolId, poolData]) => ({
            poolId,
            poolData: poolData as Object,
            metadata: (poolData as any).metadata ? await fetchMetadata((poolData as any).metadata.url) : null
        }))
      );
      return flatPools;
    };

    const handleSearchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const term = event.target.value
      setSearchTerm(term)
      setFilteredPools(await filterStakePools(term))
    };

    React.useEffect(() => {
      fetchStakePools();
      // stakePools && filterStakePools('');
    }, []);

    return (
        <Sheet sx={{ 
          width: '100%',
          bgcolor: 'background.level1', 
          borderRadius: 'sm', 
          p: 2 
        }}>
          <Typography level="h3" sx={{ mb: 2 }}>
            Stake Pools
          </Typography>
    
          <Input
            placeholder="Search by Policy ID or Token Name"
            value={searchTerm}
            //onChange={}
            sx={{ mb: 2 }}
          />
          </Sheet>
    )
} 