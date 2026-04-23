// import React, { useState, useMemo, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   Animated,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import Images from '../../assets/Images/Images';
// import { useTranslation } from 'react-i18next';
// import { useLanguage } from '../../context/LanguageProvider';
// import i18n from '../../i18n';
// import { FARMER_COLORS } from '../../colorsList/ColorList';

// const First = () => {
//   const navigation = useNavigation();
//   const { t } = useTranslation();

//   const [selectedLanguage, setSelectedLanguage] = useState(null);
//   const fadeAnim = React.useRef(new Animated.Value(0)).current;
//   const slideAnim = React.useRef(new Animated.Value(50)).current;
//   const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 800,
//         useNativeDriver: true,
//       }),
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 800,
//         useNativeDriver: true,
//       }),
//       Animated.spring(scaleAnim, {
//         toValue: 1,
//         friction: 4,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, []);

//   const languages = useMemo(
//     () => [
//       { id: 'en', name: 'English', sub: t('lang_en_sub') },
//       { id: 'hi', name: 'हिंदी', sub: t('lang_hi_sub') },
//     ],
//     [t],
//   );

//   const handleLanguageSelect = async code => {
//     setSelectedLanguage(code); // UI state
//     await i18n.changeLanguage(code); // i18n global change
//   };

//   const handleNext = () => {
//     if (selectedLanguage) {
//       navigation.navigate('BuyAndSell');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* ANIMATED TITLE */}
//       <Animated.View
//         style={{
//           opacity: fadeAnim,
//           transform: [{ translateY: slideAnim }],
//         }}
//       >
//         <Text style={styles.title}>{t('welcome')}</Text>
//         <Text style={styles.subTitle}>{t('select_language')}</Text>
//       </Animated.View>

//       {/* ANIMATED IMAGE */}
//       <Animated.View
//         style={{
//           opacity: fadeAnim,
//           transform: [{ scale: scaleAnim }],
//         }}
//       >
//         <Image
//           source={Images.secondScreen}
//           style={styles.mainImage}
//           resizeMode="contain"
//         />
//       </Animated.View>

//       {/* ANIMATED LANGUAGE OPTIONS */}
//       {languages.map((language, index) => (
//         <Animated.View
//           key={language.id}
//           style={{
//             opacity: fadeAnim,
//             transform: [
//               {
//                 translateX: fadeAnim.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: [index % 2 === 0 ? -50 : 50, 0],
//                 }),
//               },
//             ],
//           }}
//         >
//           <TouchableOpacity
//             style={[
//               styles.languageBox,
//               selectedLanguage === language.id && styles.selectedLanguageBox,
//             ]}
//             onPress={() => handleLanguageSelect(language.id)}
//             activeOpacity={0.7}
//           >
//             <View>
//               <Text style={styles.languageText}>{language.name}</Text>
//               <Text style={styles.languageSub}>{language.sub}</Text>
//             </View>

//             <View
//               style={[
//                 styles.radioCircle,
//                 selectedLanguage === language.id && styles.selectedRadioCircle,
//               ]}
//             >
//               {selectedLanguage === language.id && (
//                 <View style={styles.radioInnerCircle} />
//               )}
//             </View>
//           </TouchableOpacity>
//         </Animated.View>
//       ))}

//       {/* ANIMATED CONTINUE BUTTON */}
//       <Animated.View
//         style={{
//           opacity: fadeAnim,
//           transform: [{ translateY: slideAnim }],
//         }}
//       >
//         <TouchableOpacity
//           onPress={handleNext}
//           style={[
//             styles.continueBtn,
//             !selectedLanguage && styles.disabledContinueBtn,
//           ]}
//           disabled={!selectedLanguage}
//         >
//           <Text
//             style={[
//               styles.continueText,
//               !selectedLanguage && styles.disabledContinueText,
//             ]}
//           >
//             {t('continue')}
//           </Text>
//         </TouchableOpacity>
//       </Animated.View>
//     </View>
//   );
// };

// export default First;

// const styles = StyleSheet.create({
//   headerSpacer: {
//     height: 6,
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//     paddingHorizontal: 24,
//     paddingTop: 50,
//   },

//   title: {
//     fontSize: 28,
//     fontWeight: '700',
//     textAlign: 'center',
//     marginTop: 10,
//     color: FARMER_COLORS.primary,
//   },

//   subTitle: {
//     fontSize: 15,
//     color: '#6B7280',
//     textAlign: 'center',
//     marginTop: 6,
//     marginBottom: 30,
//   },

//   mainImage: {
//     width: '100%',
//     height: 220,
//     alignSelf: 'center',
//     marginBottom: 25,
//   },

//   languageBox: {
//     width: '100%',
//     borderWidth: 1.5,
//     borderColor: '#E5E7EB',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 15,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 5,
//   },

//   selectedLanguageBox: {
//     borderColor: FARMER_COLORS.primary,
//     backgroundColor: '#6a7e3f0C',
//     borderWidth: 1.5,
//     elevation: 0,
//   },

//   languageText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//   },

//   languageSub: {
//     fontSize: 12,
//     color: 'gray',
//     marginTop: 3,
//   },

//   radioCircle: {
//     height: 22,
//     width: 22,
//     borderRadius: 11,
//     borderWidth: 1.5,
//     borderColor: '#D1D5DB',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   selectedRadioCircle: {
//     borderColor: FARMER_COLORS.primary,
//   },

//   radioInnerCircle: {
//     height: 12,
//     width: 12,
//     borderRadius: 6,
//     backgroundColor: FARMER_COLORS.primary,
//   },

//   continueBtn: {
//     backgroundColor: FARMER_COLORS.primary,
//     paddingVertical: 16,
//     borderRadius: 14,
//     marginTop: 30,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//   },

//   disabledContinueBtn: {
//     backgroundColor: '#E0E0E0',
//   },

//   continueText: {
//     textAlign: 'center',
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },

//   disabledContinueText: {
//     color: '#9E9E9E',
//   },
// });
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Images from '../../assets/Images/Images';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { FARMER_COLORS } from '../../colorsList/ColorList';

const First = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(40)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const languages = useMemo(
    () => [
      { id: 'en', name: 'English', sub: t('lang_en_sub') },
      { id: 'hi', name: 'हिंदी', sub: t('lang_hi_sub') },
    ],
    [t],
  );

  const handleLanguageSelect = async code => {
    setSelectedLanguage(code);
    await i18n.changeLanguage(code);
  };

  const handleNext = () => {
    if (selectedLanguage) {
      navigation.navigate('BuyAndSell');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7F2" />

      {/* HERO SECTION */}
      <Animated.View
        style={[
          styles.heroContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image source={Images.secondScreen} style={styles.heroImage} />
      </Animated.View>

      {/* TITLE */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <Text style={styles.title}>{t('welcome')}</Text>
        <Text style={styles.subTitle}>{t('select_language')}</Text>
      </Animated.View>

      {/* LANGUAGE OPTIONS */}
      <View style={{ marginTop: 20 }}>
        {languages.map((language, index) => (
          <Animated.View
            key={language.id}
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateX: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [index % 2 === 0 ? -30 : 30, 0],
                  }),
                },
              ],
            }}
          >
            <TouchableOpacity
              style={[
                styles.languageCard,
                selectedLanguage === language.id && styles.selectedLanguageCard,
              ]}
              onPress={() => handleLanguageSelect(language.id)}
              activeOpacity={0.8}
            >
              <View>
                <Text style={styles.languageText}>{language.name}</Text>
                <Text style={styles.languageSub}>{language.sub}</Text>
              </View>

              <View
                style={[
                  styles.radioCircle,
                  selectedLanguage === language.id &&
                    styles.selectedRadioCircle,
                ]}
              >
                {selectedLanguage === language.id && (
                  <View style={styles.radioInnerCircle} />
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* CONTINUE BUTTON */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <TouchableOpacity
          onPress={handleNext}
          style={[styles.button, !selectedLanguage && styles.buttonDisabled]}
          disabled={!selectedLanguage}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.buttonText,
              !selectedLanguage && styles.buttonTextDisabled,
            ]}
          >
            {t('continue')}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default First;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F2', // 🌿 earthy background
    paddingHorizontal: 20,
    paddingTop: 40,
  },

  /* HERO */
  heroContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },

  heroImage: {
    width: 240,
    height: 200,
    resizeMode: 'contain',
  },

  /* TEXT */
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    color: FARMER_COLORS.primary,
  },

  subTitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 6,
  },

  /* LANGUAGE CARD */
  languageCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#E6EAE2',

    // subtle premium shadow
    shadowColor: '#2E3A2F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },

  selectedLanguageCard: {
    borderColor: FARMER_COLORS.primary,
    backgroundColor: '#EDF5E8',
  },

  languageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },

  languageSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
  },

  /* RADIO */
  radioCircle: {
    height: 22,
    width: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#C7CEC0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedRadioCircle: {
    borderColor: FARMER_COLORS.primary,
  },

  radioInnerCircle: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: FARMER_COLORS.primary,
  },

  /* BUTTON */
  button: {
    marginTop: 25,
    backgroundColor: FARMER_COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,

    shadowColor: FARMER_COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  buttonDisabled: {
    backgroundColor: '#D6D6D6',
  },

  buttonText: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  buttonTextDisabled: {
    color: '#9CA3AF',
  },
});
