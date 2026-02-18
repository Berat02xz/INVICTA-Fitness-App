import React, { useEffect, useState } from 'react';
import RevenueCatUI from 'react-native-purchases-ui';
import Toast from 'react-native-toast-message';

interface CustomerCenterProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * RevenueCat Customer Center Component
 * Displays subscription management UI
 */
export const CustomerCenter: React.FC<CustomerCenterProps> = ({
  visible,
  onClose,
}) => {
  const [presenting, setPresenting] = useState(false);

  useEffect(() => {
    if (visible && !presenting) {
      presentCustomerCenter();
    }
  }, [visible]);

  const presentCustomerCenter = async () => {
    if (presenting) return; // Prevent multiple presentations
    
    try {
      setPresenting(true);
      console.log('⚙️ Presenting Customer Center...');
      
      await RevenueCatUI.presentCustomerCenter();
      
      console.log('✅ Customer center closed');
      onClose();
    } catch (error) {
      console.error('❌ Error presenting customer center:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not open subscription management. Please try again.',
      });
      onClose();
    } finally {
      setPresenting(false);
    }
  };

  // Don't render anything - RevenueCat handles its own modal
  return null;
};

export default CustomerCenter;
