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
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  StatusBar,
  Modal,
  Pressable,
  Dimensions,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Images from '../../assets/Images/Images';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { FARMER_COLORS } from '../../colorsList/ColorList';

const { width, height } = Dimensions.get('window');

// ─────────────────────────────────────────
//  Floating Orb Component
// ─────────────────────────────────────────
const FloatingOrb = ({ x, y, size, delay, color }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(opacity, {
        toValue: 0.15,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -12,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateY }],
      }}
    />
  );
};

// ─────────────────────────────────────────
//  Shimmer Bar Component
// ─────────────────────────────────────────
const ShimmerBar = ({ barWidth, top, delay }) => {
  const translateX = useRef(new Animated.Value(-barWidth)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(translateX, {
          toValue: barWidth * 2.5,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -barWidth,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.delay(1200),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: barWidth,
        height: 2,
        top,
        left: 0,
        backgroundColor: 'rgba(66, 165, 245, 0.25)',
        borderRadius: 2,
        transform: [{ translateX }],
      }}
    />
  );
};

const First = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  const selectedLanguageData = useMemo(
    () => languages.find(lang => lang.id === selectedLanguage),
    [languages, selectedLanguage],
  );

  const selectedLanguageLabel = useMemo(
    () =>
      selectedLanguageData ? selectedLanguageData.name : t('select_language'),
    [selectedLanguageData, t],
  );

  const handleLanguageSelect = async code => {
    setSelectedLanguage(code);
    setIsDropdownOpen(false);
    await i18n.changeLanguage(code);
  };

  const handleNext = () => {
    if (selectedLanguage) {
      navigation.navigate('Roll');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E3F2FD" />

      {/* Background Gradient Layers */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.bgBase} />
        <View style={styles.bgCircleLarge} />
        <View style={styles.bgCircleMedium} />
      </View>

      {/* Floating Orbs */}
      <FloatingOrb x={-30} y={80} size={150} delay={200} color="#BBDEFB" />
      <FloatingOrb x={width - 90} y={120} size={120} delay={500} color="#90CAF9" />
      <FloatingOrb x={width * 0.2} y={height * 0.65} size={100} delay={350} color="#64B5F6" />
      <FloatingOrb x={width * 0.65} y={height * 0.75} size={80} delay={700} color="#E1F5FE" />

      {/* Shimmer Streaks */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <ShimmerBar barWidth={160} top={height * 0.15} delay={0} />
        <ShimmerBar barWidth={120} top={height * 0.35} delay={600} />
        <ShimmerBar barWidth={180} top={height * 0.55} delay={300} />
      </View>

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

      {/* LANGUAGE DROPDOWN */}
      <Animated.View
        style={[
          styles.dropdownContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.dropdownHeader}
          onPress={() => setIsDropdownOpen(true)}
          activeOpacity={0.8}
        >
          <View>
            <Text
              style={[
                styles.dropdownText,
                !selectedLanguage && styles.dropdownPlaceholderText,
              ]}
            >
              {selectedLanguageLabel}
            </Text>
            {selectedLanguageData?.sub ? (
              <Text style={styles.dropdownSubText}>
                {selectedLanguageData.sub}
              </Text>
            ) : null}
          </View>
          <Icon name="keyboard-arrow-down" size={22} color="#6B7280" />
        </TouchableOpacity>
      </Animated.View>

      <Modal
        transparent
        visible={isDropdownOpen}
        animationType="fade"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setIsDropdownOpen(false)}
        >
          <Pressable style={styles.dropdownSheet} onPress={() => {}}>
            <Text style={styles.dropdownTitle}>{t('select_language')}</Text>
            {languages.map(language => (
              <TouchableOpacity
                key={language.id}
                style={styles.dropdownOption}
                onPress={() => handleLanguageSelect(language.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.dropdownOptionText}>{language.name}</Text>
                <Text style={styles.dropdownOptionSub}>{language.sub}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

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
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 20,
    paddingTop: 40,
    overflow: 'hidden',
  },

  // Background layers
  bgBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E3F2FD',
  },
  bgCircleLarge: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: '#BBDEFB',
    top: -width * 0.5,
    left: -width * 0.3,
    opacity: 0.5,
  },
  bgCircleMedium: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: '#90CAF9',
    bottom: -width * 0.3,
    right: -width * 0.2,
    opacity: 0.4,
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
    color: '#1565C0',
  },

  subTitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#1976D2',
    marginTop: 6,
  },

  /* DROPDOWN */
  dropdownContainer: {
    marginTop: 20,
  },

  dropdownHeader: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    borderWidth: 1.5,
    borderColor: '#BBDEFB',

    shadowColor: '#42A5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  dropdownText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },

  dropdownPlaceholderText: {
    color: '#6B7280',
    fontWeight: '500',
  },

  dropdownSubText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
  },

  dropdownChevron: {
    fontSize: 16,
    color: '#6B7280',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  dropdownSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
  },

  dropdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },

  dropdownOption: {
    paddingVertical: 10,
  },

  dropdownOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },

  dropdownOptionSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  /* BUTTON */
  button: {
    marginTop: 25,
    backgroundColor: '#42A5F5',
    paddingVertical: 16,
    borderRadius: 16,

    shadowColor: '#90CAF9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
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
