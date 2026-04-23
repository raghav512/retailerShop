import { StyleSheet, Text, View } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react'
import Login from "../Signup/Login"
import FPOLogin from '../FPOScreen/FPOSignup/FPOLogin'
import StafLogin from "../userScreen/StafSignin/StafLogin"
import RetailerLogin from '../RetailerScreen/RetailerSignup/RetailerLogin'
import First from "../Signup/First"
import BuyAndSell from "../Signup/BuyAndSell"
import Getgovt from "../Signup/Getgovt"
import Roll from "../Signup/Roll"
import OTPData from '../Signup/OTPData';
import Signup from '../Signup/SignUp';
import FpoRegistration from '../FPOScreen/FpoRegistration';
import EmployeeRegistration from '../userScreen/StafSignin/EmployeeRegistration';
import Screen1 from '../Signup/Form/Screen1';
import Screen2 from '../Signup/Form/Screen2';


const Stack = createNativeStackNavigator();
const BindAuth = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown : false}}>
      
    <Stack.Screen name="First" component={First}/>
    <Stack.Screen name="BuyAndSell" component={BuyAndSell} />
    <Stack.Screen name="Getgovt" component={Getgovt} />
    <Stack.Screen name="Roll" component={Roll} />
    <Stack.Screen name="Login" component={Login} />
     <Stack.Screen name="FPOLogin" component={FPOLogin} />
    <Stack.Screen name="StafLogin" component={StafLogin} />
    <Stack.Screen name="RetailerLogin" component={RetailerLogin} />
    <Stack.Screen name="Signup" component={Signup} />
    <Stack.Screen name="FpoRegistration" component={FpoRegistration} />
    <Stack.Screen name="EmployeeRegistration" component={EmployeeRegistration} />
    <Stack.Screen name="Screen1" component={Screen1} />
    <Stack.Screen name="Screen2" component={Screen2} />
    
    <Stack.Screen name="OTPData" component={OTPData} />
 

   
  </Stack.Navigator>
  )
}

export default BindAuth

const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
  },
})