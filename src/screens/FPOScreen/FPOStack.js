import { StyleSheet, View, ActivityIndicator } from 'react-native';
import React, { Suspense } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();
import Home from './FpoScreen/Home';
import Profile from './FpoScreen/Profile';
import Visits from './FpoScreen/Visits';
import Performance from './FpoScreen/Performance';
import Ledger from './FpoScreen/Ledger';
// import FieldCropMapping from './FpoScreen/FieldCropMapping';
// import SchemesSubsidies from './FpoScreen/SchemesSubsidies';
import AddProduct from "./FpoScreen/AddProduct";
import UpdateProduct from "./FpoScreen/UpdateProduct";
import ProductDetails from "./FpoScreen/ProductDetails";
import UpdateProfile from './FpoScreen/UpdateProfile';
import Stock from "./FpoScreen/Stock";
import OrderDetails from './FpoScreen/OrderDetails';
import FarmerListing from './FpoScreen/FarmerListing';
import FarmerListingDetails from './FpoScreen/FarmerListingDetails';
import FarmerDetails from './FpoScreen/FarmerDetails';
import AllActiveFarms from './FpoScreen/AllActiveFarms';
import FarmDetails from '../farmer/farmerScreen/FarmDetails';
import Screen1 from '../Signup/Form/Screen1';
import Screen2 from '../Signup/Form/Screen2';
import Screen3 from '../Signup/Form/Screen3';
import Screen4 from '../Signup/Form/Screen4';
import Screen5 from '../Signup/Form/Screen5';
import Screen6 from '../Signup/Form/Screen6';
import Screen7 from '../Signup/Form/Screen7';
import FpoCommunity from './FpoScreen/FpoCommunity';
import OrderUpdateDetails from './FpoScreen/OrderUpdateDetails';
import BroadcastsScreen from './FpoScreen/BroadcastsScreen';
import BroadcastDetailsScreen from './FpoScreen/BroadcastDetailsScreen';
import SendBroadcastScreen from './FpoScreen/SendBroadcastScreen';
import FpoPrivateFiles from './FpoScreen/FpoPrivateFiles';
import FpoUploadDocuments from './FpoScreen/FpoUploadDocuments';
import AllTasksAssigned from './FpoScreen/AllTasksAssigned';
import AssignTask from './FpoScreen/AssignTask';
import InquiryList from './FpoScreen/InquiryList';
import InquiryDetails from './FpoScreen/InquiryDetails';
import AttendanceCalendar from './FpoScreen/AttendanceCalendar';
import { FPO_COLORS } from '../../colorsList/ColorList';

const LoadingIndicator = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={FPO_COLORS.primary} />
  </View>
);


export const UserStackHome = () => {
//   const BottomhomeTab = React.lazy(() => import('../TabScreen/Home'));
  return (

    <Suspense fallback={<LoadingIndicator />}>
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
    
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="AllActiveFarms" component={AllActiveFarms} />
            <Stack.Screen name="AssignTask" component={AssignTask} />
            <Stack.Screen name="AllTasksAssigned" component={AllTasksAssigned} />
            <Stack.Screen name="InquiryList" component={InquiryList} />
            <Stack.Screen name="InquiryDetails" component={InquiryDetails} />
            <Stack.Screen name="AttendanceCalendar" component={AttendanceCalendar} />
            <Stack.Screen name="Broadcasts" component={BroadcastsScreen} />
            <Stack.Screen name="BroadcastDetails" component={BroadcastDetailsScreen} />
            <Stack.Screen name="SendBroadcast" component={SendBroadcastScreen} />
            <Stack.Screen name="FpoCommunity" component={FpoCommunity}/>
            <Stack.Screen name="Ledger" component={Ledger} />
            <Stack.Screen name="Performance" component={Performance} />
            <Stack.Screen name="OrderDetails" component={OrderDetails} />
            <Stack.Screen name="OrderUpdateDetails" component={OrderUpdateDetails} />
            <Stack.Screen name="FarmerListing" component={FarmerListing} />
            <Stack.Screen name="FarmerListingDetails" component={FarmerListingDetails} />
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
};


export const UserStackVisit = () => {

  return (

    <Suspense fallback={<LoadingIndicator />}>
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
    
            <Stack.Screen name="Visits" component={Visits} />
            <Stack.Screen name="FarmerDetails" component={FarmerDetails} />
            <Stack.Screen name="FarmDetails" component={FarmDetails} />
            <Stack.Screen name="Screen1" component={Screen1} />
            <Stack.Screen name="Screen2" component={Screen2} />
            <Stack.Screen name="Screen3" component={Screen3} />
            <Stack.Screen name="Screen4" component={Screen4} />
            <Stack.Screen name="Screen5" component={Screen5} />
            <Stack.Screen name="Screen6" component={Screen6} />
            <Stack.Screen name="Screen7" component={Screen7} />
            {/* <Stack.Screen name="PropertyListDetail" component={PropertyListDetail} /> */}
     
     
    </Stack.Navigator>
    </Suspense>
  );
};



export const UserStackPerformance = () => {

  return (

    <Suspense fallback={<LoadingIndicator />}>
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
    
            <Stack.Screen name="Performance" component={Performance} />
            <Stack.Screen name="AddProduct" component={AddProduct} />
            <Stack.Screen name="UpdateProduct" component={UpdateProduct} />
            <Stack.Screen name="ProductDetails" component={ProductDetails} />
          
            {/* <Stack.Screen name="PropertyListDetail" component={PropertyListDetail} /> */}
     
     
    </Stack.Navigator>
    </Suspense>
  );
};

export const UserStackStock = () => {

  return (

    <Suspense fallback={<LoadingIndicator />}>
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
    
            <Stack.Screen name="Stock" component={Stock} />
          
            {/* <Stack.Screen name="PropertyListDetail" component={PropertyListDetail} /> */}
     
     
    </Stack.Navigator>
    </Suspense>
  );
};




export const UserStackProfile= () => {

  return (

    <Suspense fallback={<LoadingIndicator />}>
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
    
            <Stack.Screen name="Profile" component={Profile} />
            {/* <Stack.Screen name="FieldCropMapping" component={FieldCropMapping} /> */}
            {/* <Stack.Screen name="SchemesSubsidies" component={SchemesSubsidies} /> */}
            <Stack.Screen name="FpoUploadDocuments" component={FpoUploadDocuments} />
            <Stack.Screen name="FpoPrivateFiles" component={FpoPrivateFiles} />
            <Stack.Screen name="UpdateProfile" component={UpdateProfile} />
          
            {/* <Stack.Screen name="PropertyListDetail" component={PropertyListDetail} /> */}
     
     
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
