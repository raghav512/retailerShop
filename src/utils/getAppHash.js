import { Platform, NativeModules } from 'react-native';

export const getAppHash = async () => {
  if (Platform.OS === 'android') {
    try {
      const { AppHashModule } = NativeModules;
      if (AppHashModule) {
        const hash = await AppHashModule.getAppHash();
        console.log('📱 App Hash for SMS:', hash);
        console.log('📝 Backend must send SMS like: <#> Your OTP is 123456 ' + hash);
        return hash;
      }
    } catch (error) {
      console.log('Error getting app hash:', error);
    }
  }
  return null;
};
