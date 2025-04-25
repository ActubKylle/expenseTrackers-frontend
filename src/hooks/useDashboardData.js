import { useState, useCallback, useEffect } from 'react';
import { getDashboardSummary } from '../api/dashboard';

export const useDashboardData = (timeFilter) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cache, setCache] = useState({});

  const fetchData = useCallback(async (force = false) => {
    const cacheKey = timeFilter;
    const cacheTime = 5 * 60 * 1000; // 5 minutes

    // Check cache
    if (!force && cache[cacheKey]?.timestamp && 
        Date.now() - cache[cacheKey].timestamp < cacheTime) {
      setData(cache[cacheKey].data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getDashboardSummary();
      
      setData(response);
      setCache(prev => ({
        ...prev,
        [cacheKey]: {
          data: response,
          timestamp: Date.now()
        }
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [timeFilter, cache]);

  useEffect(() => {
    fetchData();
  }, [timeFilter]);

  return { data, loading, error, refetch: () => fetchData(true) };
};
