import React, { Suspense } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RETAILER_COLORS } from '../../colorsList/ColorList';
import RetailerHome from './RetailerTabs/RetailerHome';
import RetailerMarketplace from './RetailerTabs/RetailerMarketplace';
import RetailerOrders from './RetailerTabs/RetailerOrders';
import RetailerOrderDetails from './RetailerTabs/RetailerOrderDetails';
import RetailerInquiry from './RetailerTabs/RetailerInquiry';
import RetailerDocuments from './RetailerTabs/RetailerDocuments';
import RetailerProfile from './RetailerTabs/RetailerProfile';
import RetailerProductDetails from './RetailerTabs/RetailerProductDetail.js';
import RetailerCart from './RetailerTabs/RetailerCart';
import BroadcastsScreen from './RetailerTabs/BroadcastsScreen';
import BroadcastDetailsScreen from './RetailerTabs/BroadcastDetailsScreen';

// Profile Screens
import PersonalDetails from './RetailerProfile/PersonalDetails';
import AddressDetails from './RetailerProfile/AddressDetails';
import BankDetails from './RetailerProfile/BankDetails';
import ProfileDocuments from './RetailerProfile/Documents';
import PrivateFiles from './RetailerProfile/PrivateFiles';
const Stack = createNativeStackNavigator();

const LoadingIndicator = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={RETAILER_COLORS.primary} />
  </View>
);

export const RetailerStackHome = () => {
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="RetailerHome" component={RetailerHome} />
        <Stack.Screen
          name="BroadcastsScreen"
          component={BroadcastsScreen}
        />
        <Stack.Screen
          name="BroadcastDetailsScreen"
          component={BroadcastDetailsScreen}
        />
        <Stack.Screen
          name="RetailerMarketplace"
          component={RetailerMarketplace}
        />
        <Stack.Screen name="RetailerCart" component={RetailerCart} />
        <Stack.Screen
          name="RetailerProductDetails"
          component={RetailerProductDetails}
        />
        <Stack.Screen name="RetailerOrders" component={RetailerOrders} />
        <Stack.Screen name="RetailerInquiry" component={RetailerInquiry} />
        <Stack.Screen name="RetailerDocuments" component={RetailerDocuments} />
        <Stack.Screen name="RetailerProfile" component={RetailerProfile} />
      </Stack.Navigator>
    </Suspense>
  );
};

export const RetailerStackMarketplace = () => {
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="RetailerMarketplace"
          component={RetailerMarketplace}
        />
        <Stack.Screen name="RetailerOrders" component={RetailerOrders} />
        <Stack.Screen name="RetailerInquiry" component={RetailerInquiry} />
        <Stack.Screen name="RetailerCart" component={RetailerCart} />
        <Stack.Screen
          name="RetailerProductDetails"
          component={RetailerProductDetails}
        />
      </Stack.Navigator>
    </Suspense>
  );
};

export const RetailerStackOrders = () => {
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="RetailerOrders" component={RetailerOrders} />
        <Stack.Screen
          name="RetailerOrderDetails"
          component={RetailerOrderDetails}
        />
        <Stack.Screen name="RetailerInquiry" component={RetailerInquiry} />
        <Stack.Screen name="RetailerDocuments" component={RetailerDocuments} />
      </Stack.Navigator>
    </Suspense>
  );
};

export const RetailerStackProfile = () => {
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="RetailerProfile" component={RetailerProfile} />
        <Stack.Screen
          name="RetailerPersonalDetails"
          component={PersonalDetails}
        />
        <Stack.Screen
          name="RetailerAddressDetails"
          component={AddressDetails}
        />
        <Stack.Screen name="RetailerBankDetails" component={BankDetails} />
        <Stack.Screen name="RetailerDocuments" component={ProfileDocuments} />
        <Stack.Screen name="RetailerPrivateFiles" component={PrivateFiles} />
      </Stack.Navigator>
    </Suspense>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
