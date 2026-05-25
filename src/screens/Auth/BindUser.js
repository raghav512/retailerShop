import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TabStackuser from '../userScreen/Tabs/Stack';
import Tabfarmer from '../farmer/Tabfarmer';
import TabFPO from '../../screens/FPOScreen/TabFPO';
import { normalizeOtpRoleId } from '../../utils/otpRole';

const BindUser = ({ role }) => {
  // 🔹 Role based rendering
  const renderByRole = () => {
    const normalizedRole =
      normalizeOtpRoleId(role) || role?.toString?.().trim?.() || '';

    switch (normalizedRole) {
      case 'Farmer':
        return <Tabfarmer />;
      case 'Staff':
        return <TabStackuser />;
      case 'Retailer':
        return <TabFPO />;
      default:
        return <TabStackuser />;
    }
  };

  return <SafeAreaView style={styles.container}>{renderByRole()}</SafeAreaView>;
};

export default BindUser;

const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
