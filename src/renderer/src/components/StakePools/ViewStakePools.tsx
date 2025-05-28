import * as React from 'react';
import { Sheet, Typography, Input, Box, Button } from '@mui/joy';
import { getStakePools } from '../../API/ogmios';
import CircularProgress from '@mui/joy/CircularProgress';

interface Pool {
    poolId: string;
    poolData: {
        metadata: {
          name: string;
          ticker: string;
        },
        cost: {
          ada: {
            lovelace: number;
          }; 
        };
        stakedAda: number;
        saturation: number;
        pledge: {
            ada: {
                lovelace: number;
            };
        };
        margin: string;
        ros: number;
    };
    metadata: any;
}

export const ViewStakePools = () => {
    const fetchMetadata = (metadataURL: string): Promise<any> => window.api.fetchMetadata(metadataURL);
    const [searchTerm, setSearchTerm] = React.useState<string>('');
    const [stakePools, setStakePools] = React.useState<Pool[]>([]);
    const [allStakePools, setAllStakePools] = React.useState<Pool[]>([]); // Store the full list
    const [loading, setLoading] = React.useState<boolean>(false);

    const filterStakePools = async (term: string) => {
        if (term === '') {
            setStakePools(allStakePools); // Reset to the full list
        } else {
            setStakePools(stakePools.filter((pool) =>
                pool.poolId.toLowerCase().includes(term.toLowerCase()) ||
                pool.metadata !== undefined && pool.metadata.name && pool.metadata.name.toLowerCase().includes(term.toLowerCase()) ||
                pool.metadata !== undefined && pool.metadata.ticker && pool.metadata.ticker.toLowerCase().includes(term.toLowerCase())
            ));
        }
    };

    const fetchStakePools = async () => {
        setLoading(true);
        const stakePoolsRes = await getStakePools();
        console.log('stakePoolsRes', stakePoolsRes);
        const parsePoolsRes = await parsePools(stakePoolsRes);
        setStakePools(parsePoolsRes);
        setAllStakePools(parsePoolsRes); // Store the full list
        setLoading(false);
        console.log('parsePoolsRes', parsePoolsRes);
    };

    const parsePools = async (stakePools: any) => {
        let poolscount = Object.entries(stakePools).length;
        console.log('poolscount', poolscount);
        const flatPools: Pool[] = await Promise.all(
            Object.entries(stakePools).map(async ([poolId, poolData]) => ({
                poolId,
                poolData: {
                    ...poolData as any,
                    stakedAda: (poolData as any).stake.ada.lovelace || 0,
                    saturation: ((poolData as any).stake.ada.lovelace / 74000000000000) || 0,
                    pledge: (poolData as any).pledge || 0,
                    margin: (poolData as any).margin || 0,
                    ros: (poolData as any).ros || 0
                },
                metadata: (poolData as any).metadata && (poolData as any).metadata.url && await fetchMetadata((poolData as any).metadata.url)
            }))
        );
        return flatPools;
    };

    const handleSearchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const term = event.target.value;
        setSearchTerm(term);
        await filterStakePools(term);
    };

    React.useEffect(() => {
        fetchStakePools();
    }, []);

    return (
        <Sheet sx={{ 
            width: '100%',
            bgcolor: 'background.level1', 
            borderRadius: 'sm', 
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: '100%' // Ensure the Sheet takes the full height of its parent
        }}>
            <Typography level="h3" sx={{ mb: 2 }}>
                Stake Pools {stakePools.length > 0 && `(${stakePools.length})`} {loading && <span style={{fontSize: 16}}><CircularProgress variant="soft" /> [This might take a while as all data is loaded live from the chain and then pool metadata if available is pulled.]</span>}
            </Typography>

            <Input
                placeholder="Search by Pool ID, Pool Name, or Ticker"
                value={searchTerm}
                onChange={(event) => handleSearchChange(event)}
                sx={{ mb: 2 }}
            />

            <Box sx={{ 
                flexGrow: 1, // Allow the Box to take remaining space
                overflowY: 'auto', // Enable scrolling for the pool list
                borderRadius: 'sm',
                bgcolor: 'background.level1',
                p: 2,
                maxHeight: '70vh' // Set a maximum height to ensure scrolling
            }}>
                <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap: 2
                }}>
                    {stakePools.length > 0 && stakePools.map((pool, index) => (
                        <Sheet
                            key={pool.poolId}
                            sx={{
                                p: 2,
                                borderRadius: 'sm',
                                bgcolor: 'background.level2',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography level="body-sm" fontWeight="bold">
                                    {pool.metadata !== undefined && `${pool.metadata.name} [${pool.metadata.ticker}]`} #{index + 1}
                                </Typography>
                            </Box>

                            <Typography level="body-sm" sx={{ wordBreak: 'break-all' }}>
                                Pool-ID: {pool.poolId}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography level="body-sm">Staked ADA:</Typography>
                                <Typography level="body-sm" color={pool.poolData.stakedAda > 90 ? 'success' : 'success'}>
                                    ₳ {pool.poolData.stakedAda.toFixed(1)}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography level="body-sm">Saturation:</Typography>
                                <Typography level="body-sm" color={pool.poolData.saturation > 90 ? 'danger' : 'success'}>
                                    {pool.poolData.saturation.toFixed(1)}%
                                </Typography>
                            </Box>
                            <Box sx={{ width: '100%', bgcolor: 'background.level3', borderRadius: 'sm', height: '8px' }}>
                                <Box
                                    sx={{
                                        width: `${Math.min(pool.poolData.saturation, 100)}%`,
                                        bgcolor: pool.poolData.saturation > 90 ? 'danger.500' : 'success.500',
                                        height: '100%',
                                        borderRadius: 'sm'
                                    }}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography level="body-sm">Pledge:</Typography>
                                <Typography level="body-sm">
                                    ₳ {pool.poolData.pledge.ada.lovelace / 1000000}
                                </Typography>
                            </Box>
                            <Box sx={{ width: '100%', bgcolor: 'background.level3', borderRadius: 'sm', height: '8px' }}>
                                <Box
                                    sx={{
                                        width: '100%',
                                        bgcolor: 'primary.500',
                                        height: '100%',
                                        borderRadius: 'sm'
                                    }}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography level="body-sm">Margin:</Typography>
                                <Typography level="body-sm">
                                    {(eval(pool.poolData.margin)*100).toFixed(1)}%
                                </Typography>
                            </Box>
                            <Box sx={{ width: '100%', bgcolor: 'background.level3', borderRadius: 'sm', height: '8px' }}>
                                <Box
                                    sx={{
                                        width: `${Math.min(eval(pool.poolData.margin))/100}%`,
                                        bgcolor: 'success.500',
                                        height: '100%',
                                        borderRadius: 'sm'
                                    }}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography level="body-sm">ROS:</Typography>
                                <Typography level="body-sm">
                                    {pool.poolData.ros.toFixed(1)}%
                                </Typography>
                            </Box>
                            <Box sx={{ width: '100%', bgcolor: 'background.level3', borderRadius: 'sm', height: '8px' }}>
                                <Box
                                    sx={{
                                        width: '100%',
                                        bgcolor: 'success.500',
                                        height: '100%',
                                        borderRadius: 'sm'
                                    }}
                                />
                            </Box>

                            <Button variant="solid" color="primary" sx={{ mt: 1 }}>
                                Delegate
                            </Button>
                        </Sheet>
                    ))}
                </Box>
            </Box>
        </Sheet>
    );
};