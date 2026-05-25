import { StyleSheet, View, ActivityIndicator } from 'react-native';
import React, { Suspense } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from '../TabScreen/Home';
import Profile from '../TabScreen/Profile';
import StaffAttendance from '../TabScreen/StaffAttendance';
import Visits from '../TabScreen/Visits';
import Performance from '../TabScreen/Performance';
import HomeSecond from '../TabScreen/HomeSecond';
import Inquiry from '../TabScreen/Inquiry';
import InquiryDetails from '../TabScreen/InquiryDetails';
import StaffInquiry from '../TabScreen/StaffInquiry';
import Attendance from '../TabScreen/Attendance';
import ApplyLeave from '../TabScreen/ApplyLeave';
import Orders from '../TabScreen/Orders';
import OrderDetails from '../TabScreen/OrderDetails';
import TaskAssigned from '../TabScreen/TaskAssigned';
import Listing from '../TabScreen/Listing';
import ListingDetails from '../TabScreen/ListingDetails';
import AddPurchaseEntry from '../TabScreen/AddPurchaseEntry ';
import PurchaseDetails from '../TabScreen/PurchaseDetails';
import EditProfile from '../TabScreen/EditProfile';
import StaffCreateListing from '../TabScreen/StaffCreateListing';
import StaffCommunity from '../TabScreen/StaffCommunity';
import BroadcastsScreen from '../TabScreen/BroadcastsScreen';
import BroadcastDetailsScreen from '../TabScreen/BroadcastDetailsScreen';
import StaffInventory from '../TabScreen/StaffInventory';
import StaffAddProduct from '../TabScreen/StaffAddProduct';
import StaffUpdateProduct from '../TabScreen/StaffUpdateProduct';
import StaffProductDetails from '../TabScreen/StaffProductDetails';
import AddFarmerOrder from '../TabScreen/AddFarmerOrder';
import MarketPlace from '../../farmer/farmerScreen/MarketPlace';
import MarketplaceProductDetails from '../../farmer/farmerScreen/MarketplaceProductDetails';
import Cart from '../../farmer/farmerScreen/Cart';
import Screen1 from '../../Signup/Form/Screen1';
import Screen2 from '../../Signup/Form/Screen2';
import Screen3 from '../../Signup/Form/Screen3';
import Screen4 from '../../Signup/Form/Screen4';
import Screen5 from '../../Signup/Form/Screen5';
import Screen6 from '../../Signup/Form/Screen6';
import Screen7 from '../../Signup/Form/Screen7';
import TaskDetailScreen from '../TabScreen/TaskDetailScreen';

const Stack = createNativeStackNavigator();

const LoadingIndicator = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#3A9D4F" />
  </View>
);

export const UserStackHome = () => (
  <Suspense fallback={<LoadingIndicator />}>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Broadcasts" component={BroadcastsScreen} />
      <Stack.Screen
        name="BroadcastDetails"
        component={BroadcastDetailsScreen}
      />
      <Stack.Screen name="HomeSecond" component={HomeSecond} />
      <Stack.Screen name="Inquiry" component={Inquiry} />
      <Stack.Screen name="StaffInquiry" component={StaffInquiry} />
      <Stack.Screen name="InquiryDetails" component={InquiryDetails} />
      <Stack.Screen name="Attendance" component={Attendance} />
      <Stack.Screen name="ApplyLeave" component={ApplyLeave} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen name="Orders" component={Orders} />
      <Stack.Screen name="OrderDetails" component={OrderDetails} />
      <Stack.Screen name="TaskAssigned" component={TaskAssigned} />
      <Stack.Screen name="Listing" component={Listing} />
      <Stack.Screen name="ListingDetails" component={ListingDetails} />
      <Stack.Screen name="StaffCreateListing" component={StaffCreateListing} />
      <Stack.Screen name="StaffCommunity" component={StaffCommunity} />
      <Stack.Screen name="AddFarmerOrder" component={AddFarmerOrder} />
      <Stack.Screen name="MarketPlace" component={MarketPlace} />
      <Stack.Screen name="MarketplaceProductDetails" component={MarketplaceProductDetails} />
      <Stack.Screen name="Cart" component={Cart} />
    </Stack.Navigator>
  </Suspense>
);

export const UserStackVisit = () => (
  <Suspense fallback={<LoadingIndicator />}>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Visits" component={Visits} />
      <Stack.Screen name="Screen1" component={Screen1} />
      <Stack.Screen name="Screen2" component={Screen2} />
      <Stack.Screen name="Screen3" component={Screen3} />
      <Stack.Screen name="Screen4" component={Screen4} />
      <Stack.Screen name="Screen5" component={Screen5} />
      <Stack.Screen name="Screen6" component={Screen6} />
      <Stack.Screen name="Screen7" component={Screen7} />
    </Stack.Navigator>
  </Suspense>
);

export const UserStackPerformance = () => (
  <Suspense fallback={<LoadingIndicator />}>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Performance" component={Performance} />
      <Stack.Screen name="AddPurchaseEntry" component={AddPurchaseEntry} />
      <Stack.Screen name="PurchaseDetails" component={PurchaseDetails} />
    </Stack.Navigator>
  </Suspense>
);

export const UserStackInventory = () => (
  <Suspense fallback={<LoadingIndicator />}>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StaffInventory" component={StaffInventory} />
      <Stack.Screen name="StaffAddProduct" component={StaffAddProduct} />
      <Stack.Screen name="StaffUpdateProduct" component={StaffUpdateProduct} />
      <Stack.Screen
        name="StaffProductDetails"
        component={StaffProductDetails}
      />
    </Stack.Navigator>
  </Suspense>
);

export const UserStackProfile = () => (
  <Suspense fallback={<LoadingIndicator />}>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="StaffAttendance" component={StaffAttendance} />
    </Stack.Navigator>
  </Suspense>
);

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
