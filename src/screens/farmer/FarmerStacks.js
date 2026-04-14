import { StyleSheet, View, ActivityIndicator } from 'react-native';
import React, { Suspense } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import FarmerHome from './farmerScreen/FarmerHome';
import MarketPlace from './farmerScreen/MarketPlace';
import MarketplaceProductDetails from './farmerScreen/MarketplaceProductDetails';
import MyListing from './farmerScreen/MyListing';
import FarmerProfile from './farmerScreen/FarmerProfile';
import Documents from './farmerScreen/Documents';
import CreateListing from './farmerScreen/CreateListing';
import Cart from './farmerScreen/Cart';
import CropDoctor from './farmerScreen/CropDoctor';
import ChatBot from './farmerScreen/ChatBot';
import ScreenOne from './FarmerProfile/ScreenOne';
import ScreenSecond from './FarmerProfile/ScreenSecond';
import ScreenThird from './FarmerProfile/ScreenThird';
import ScreenFourth from './FarmerProfile/ScreenFourth';
import ScreenSixth from './FarmerProfile/ScreenSixth';
import ScreenSeventh from './FarmerProfile/ScreenSeventh';
import MyFarms from './farmerScreen/MyFarms';
import AddFarm from './farmerScreen/AddFarm';
import FarmDetails from './farmerScreen/FarmDetails';
import EditFarm from './farmerScreen/EditFarm';
import MyCrops from './farmerScreen/MyCrops';
import AddCrop from './farmerScreen/AddCrop';
import CropDetails from './farmerScreen/CropDetails';
import EditCrop from './farmerScreen/EditCrop';
import EditListing from './farmerScreen/EditListing';
import DiagonsisHistory from './farmerScreen/DiagnosisHistory';
import Community from './farmerScreen/Community';
import MyOrders from './farmerScreen/MyOrders';
import BroadcastsScreen from './farmerScreen/BroadcastsScreen';
import BroadcastDetailsScreen from './farmerScreen/BroadcastDetailsScreen';
import PrivateFiles from './farmerScreen/PrivateFiles';
import CropCalendarDetail from './farmerScreen/CropCalendarDetail';
import MandiPricesScreen from './farmerScreen/MandiPricesScreen';
const Stack = createNativeStackNavigator();

// ✅ define color (or import if you already have it)
const colorPrimary = '#D97706';

const LoadingIndicator = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={colorPrimary} />
  </View>
);

export const FarmerStackHome = () => {
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={FarmerHome} />
        <Stack.Screen name="Documents" component={Documents} />
        <Stack.Screen name="CropDoctor" component={CropDoctor} />
        <Stack.Screen name="ChatBot" component={ChatBot} />
        <Stack.Screen name="MyFarms" component={MyFarms} />
        <Stack.Screen name="AddFarm" component={AddFarm} />
        <Stack.Screen name="FarmDetails" component={FarmDetails} />
        <Stack.Screen name="EditFarm" component={EditFarm} />
        <Stack.Screen name="MyCrops" component={MyCrops} />
        <Stack.Screen name="AddCrop" component={AddCrop} />
        <Stack.Screen name="CropDetails" component={CropDetails} />
        <Stack.Screen name="EditCrop" component={EditCrop} />
        <Stack.Screen name="CreateListing" component={CreateListing} />
        <Stack.Screen name="FarmerProfile" component={FarmerProfile} />
        <Stack.Screen name="PersonalDetails" component={ScreenOne} />
        <Stack.Screen name="AddressDetails" component={ScreenSecond} />
        <Stack.Screen name="FarmerCategory" component={ScreenThird} />
        <Stack.Screen name="CropsGrown" component={ScreenFourth} />
        <Stack.Screen name="ScreenSixth" component={ScreenSixth} />
        <Stack.Screen name="ScreenSeventh" component={ScreenSeventh} />
        <Stack.Screen name="DiagonsisHistory" component={DiagonsisHistory} />
        <Stack.Screen name="Community" component={Community} />
        <Stack.Screen name="MyOrders" component={MyOrders} />
        <Stack.Screen name="Broadcasts" component={BroadcastsScreen} />
        <Stack.Screen name="BroadcastDetails" component={BroadcastDetailsScreen} />
        <Stack.Screen name="PrivateFiles" component={PrivateFiles} />
        <Stack.Screen name="CropCalendarDetail" component={CropCalendarDetail} />
        <Stack.Screen name="MandiPricesScreen" component={MandiPricesScreen} />
      </Stack.Navigator>
    </Suspense>
  );
};

export const FarmerStackMarket = () => {
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MarketPlace" component={MarketPlace} />
        <Stack.Screen name="MarketplaceProductDetails" component={MarketplaceProductDetails} />
        <Stack.Screen name="Cart" component={Cart} />
      </Stack.Navigator>
    </Suspense>
  );
};

export const FarmerStackListing = () => {
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="MyListing"
      >
        <Stack.Screen name="MyListing" component={MyListing} />
        <Stack.Screen name="CreateListing" component={CreateListing} />
        <Stack.Screen name="EditListing" component={EditListing} />
      </Stack.Navigator>
    </Suspense>
  );
};

export const FarmerStackProfile = () => {
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="FarmerProfile" component={FarmerProfile} />
        <Stack.Screen name="PersonalDetails" component={ScreenOne} />
        <Stack.Screen name="AddressDetails" component={ScreenSecond} />
        <Stack.Screen name="FarmerCategory" component={ScreenThird} />
        <Stack.Screen name="CropsGrown" component={ScreenFourth} />
        <Stack.Screen name="ScreenSixth" component={ScreenSixth} />
        <Stack.Screen name="ScreenSeventh" component={ScreenSeventh} />
        <Stack.Screen name="PrivateFiles" component={PrivateFiles} />
      </Stack.Navigator>
    </Suspense>
  );
};

const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

