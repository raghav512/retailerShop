import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Images from '../../assets/Images/Images';
import { FARMER_COLORS } from '../../colorsList/ColorList';

const BuyAndSell = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleNext = () => {
    navigation.navigate('Getgovt');
  };
  return (
    <View style={styles.container}>
      {/* ANIMATED APP NAME */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <Text style={styles.appName}>Retailer Management System</Text>
        <Text style={styles.subTitle}>{t('buy_sell_subtitle')}</Text>
      </Animated.View>

      {/* ANIMATED MAIN IMAGE CARD */}
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={Images.thirdScreen}
          style={styles.mainImage}
          resizeMode="cover"
        />
      </Animated.View>

      {/* DOT INDICATOR */}
      <Animated.View style={[styles.dotContainer, { opacity: fadeAnim }]}>
        <View style={styles.dotActive} />
      </Animated.View>

      {/* ANIMATED NEXT BUTTON */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <TouchableOpacity
          onPress={() => handleNext()}
          style={styles.nextButton}
        >
          <Text style={styles.nextText}>{t('next')}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ANIMATED SKIP BUTTON */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate('Roll')}
        >
          <Text style={styles.skipText}>{t('skip')}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 50,
  },

  appName: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 5,
    color: FARMER_COLORS.primary,
  },

  subTitle: {
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 4,
    color: '#6B7280',
    fontSize: 14,
  },

  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 35,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: FARMER_COLORS.primary,
  },

  cardSubtitle: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 10,
  },

  mainImage: {
    width: '100%',
    height: 500,
  },

  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },

  dotActive: {
    height: 6,
    width: 20,
    borderRadius: 3,
    backgroundColor: FARMER_COLORS.primary,
  },

  nextButton: {
    backgroundColor: FARMER_COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 35,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },

  nextText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  skipButton: {
    marginTop: 12,
  },

  skipText: {
    textAlign: 'center',
    fontSize: 14,
    color: 'gray',
  },
});

export default BuyAndSell;
