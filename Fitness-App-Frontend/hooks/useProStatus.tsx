import { useState, useEffect } from 'react';
import RevenueCatService from '@/api/RevenueCatService';
import { CustomerInfo } from 'react-native-purchases';

/**
 * Hook to check if user has PRO subscription
 * @returns {boolean} isPro - Whether user has active PRO entitlement
 * @returns {boolean} loading - Whether the check is in progress
 * @returns {Function} refresh - Function to refresh PRO status
 */
export const useProStatus = () => {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  const checkProStatus = async () => {
    try {
      setLoading(true);
      const proActive = await RevenueCatService.isProActive();
      const info = await RevenueCatService.getCustomerInfo();
      setIsPro(proActive);
      setCustomerInfo(info);
    } catch (error) {
      console.error('Error checking PRO status:', error);
      setIsPro(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkProStatus();
  }, []);

  return {
    isPro,
    loading,
    customerInfo,
    refresh: checkProStatus,
  };
};
