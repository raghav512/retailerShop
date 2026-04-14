import React, { useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Modal,
  View,
  Text,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { FARMER_COLORS } from '../../colorsList/ColorList';

const LanguageSwitcher = ({ style, iconSize = 24, iconColor = FARMER_COLORS.primaryLight }) => {
  const { i18n } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0));

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const openModal = () => {
    setModalVisible(true);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const changeLanguage = async (langCode) => {
    await i18n.changeLanguage(langCode);
    closeModal();
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.iconButton, style]}
        onPress={openModal}
        activeOpacity={0.7}
      >
        <Icon name="language-outline" size={iconSize} color={iconColor} />
      </TouchableOpacity>

      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Icon name="language" size={28} color={FARMER_COLORS.primaryLight} />
              <Text style={styles.modalTitle}>Select Language</Text>
            </View>

            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  currentLanguage.code === lang.code && styles.selectedOption,
                ]}
                onPress={() => changeLanguage(lang.code)}
                activeOpacity={0.7}
              >
                <View style={styles.languageInfo}>
                  <View>
                    <Text style={styles.languageName}>{lang.name}</Text>
                    <Text style={styles.nativeName}>{lang.nativeName}</Text>
                  </View>
                </View>
                {currentLanguage.code === lang.code && (
                  <Icon name="checkmark-circle" size={24} color={FARMER_COLORS.primaryLight} />
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginLeft: 12,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9F9F9',
  },
  selectedOption: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: FARMER_COLORS.primaryLight,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  nativeName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default LanguageSwitcher;

