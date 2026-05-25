import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { showAlert } from '../../../common/reusableComponent/CustomAlert';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';

const SEASONS = ['kharif', 'rabi', 'zaid'];

const Screen4 = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const route = useRoute();

  const { screen3Data, themeColor = '#D97706' } = route.params || {};

  const [cropName, setCropName] = useState('');
  const [season, setSeason] = useState('');
  const [quantity, setQuantity] = useState('');

  const isFormValid = cropName && season;

  const handleContinue = () => {
    if (!isFormValid) {
      showAlert({
        type: 'warning',
        title: t('error'),
        message: t('select_crop_season'),
      });
      return;
    }

    const cropsGrown = [
      {
        cropName: cropName.trim(),
        season: season.toLowerCase(),
        quantityProduced: quantity || '',
      },
    ];

    const screen4Data = {
      ...screen3Data,
      cropsGrown,
    };

    navigation.navigate('Screen5', { screen4Data, themeColor });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.stepText}>{t('step_4_of_5')}</Text>
        </View>

        <View style={styles.progressBarBg}>
          <View
            style={[styles.progressBarFill, { backgroundColor: themeColor }]}
          />
        </View>
      </View>

      {/* CARD */}
      <View style={styles.card}>
        <View
          style={[styles.iconWrapper, { backgroundColor: `${themeColor}20` }]}
        >
          <Icon name="leaf-outline" size={20} color={themeColor} />
        </View>

        <Text style={styles.cardTitle}>{t('crops_grown')}</Text>
        <Text style={styles.cardSub}>{t('current_year')}</Text>

        {/* CROP */}
        <Text style={styles.label}>{t('crop_name')} *</Text>
        <TextInput
          placeholder={t('enter_crop_name')}
          style={styles.input}
          value={cropName}
          onChangeText={setCropName}
        />
        <Text style={{ fontSize: 60, fontWeight: 'bold', color: 'red' }}>
          hiiiii
        </Text>
        {/* SEASON */}
        <Text style={styles.label}>{t('season')} *</Text>
        <View style={styles.seasonRow}>
          {SEASONS.map(item => (
            <TouchableOpacity
              key={item}
              style={[
                styles.seasonBtn,
                season === item && {
                  ...styles.seasonBtnActive,
                  backgroundColor: `${themeColor}20`,
                  borderColor: themeColor,
                },
              ]}
              onPress={() => setSeason(item)}
            >
              <Text
                style={[
                  styles.seasonText,
                  season === item && {
                    ...styles.seasonTextActive,
                    color: themeColor,
                  },
                ]}
              >
                {t(item)} {/* 🔥 localized */}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* QUANTITY */}
        <Text style={styles.label}>{t('quantity_optional')}</Text>
        <TextInput
          placeholder={t('quantity_placeholder')}
          style={styles.input}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />
      </View>

      {/* CONTINUE */}
      <TouchableOpacity
        style={[
          styles.continueBtn,
          { backgroundColor: themeColor },
          !isFormValid && styles.continueBtnDisabled,
        ]}
        disabled={!isFormValid}
        onPress={handleContinue}
      >
        <Text style={styles.continueText}>{t('continue')} ›</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

export default Screen4;

const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
  },
  container: {
    flex: 1,
    backgroundColor: '#F4F6F5',
  },

  /* HEADER */
  header: {
    padding: 16,
    backgroundColor: '#F4F6F5',
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDEDED',
    justifyContent: 'center',
    alignItems: 'center',
  },

  backIcon: {
    fontSize: 22,
    color: '#333',
    lineHeight: 22,
  },

  stepText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  progressBarBg: {
    height: 4,
    width: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },

  progressBarFill: {
    height: 4,
    width: '56%', // Step 4 of 7
    borderRadius: 2,
  },

  /* CARD */
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSub: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },

  /* FORM */
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
    color: '#333',
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FAFAFA',
    fontSize: 14,
    color: '#333',
  },

  /* SEASON */
  seasonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  seasonBtn: {
    width: '32%',
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seasonBtnActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#D97706',
  },
  seasonText: {
    fontSize: 13,
    color: '#555',
  },
  seasonTextActive: {
    color: '#D97706',
    fontWeight: '600',
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FAFAFA',
    fontSize: 14,
  },

  /* ADD MORE */
  addMoreBtn: {
    marginTop: 14,
    backgroundColor: '#EAF4EA',
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMoreText: {
    fontSize: 13,
    color: '#D97706',
    fontWeight: '600',
  },

  /* CONTINUE */
  continueBtn: {
    backgroundColor: '#D97706',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  continueBtnDisabled: {
    opacity: 0.5,
  },
  continueText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
