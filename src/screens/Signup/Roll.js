import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Images from '../../assets/Images/Images';
import { useNavigation } from '@react-navigation/native';
import { setUserData } from '../../Redux/Storage';
import { useTranslation } from 'react-i18next';
import {
  FARMER_COLORS,
  FPO_COLORS,
  STAFF_COLORS,
} from '../../colorsList/ColorList';

const Roll = () => {
  const navigation = useNavigation();
  const { t } = useTranslation(); // 🌍
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: 'Farmer',
      name: t('role_farmer'),
      desc: t('role_farmer_desc'),
      icon: '👨‍🌾',
      bgColor: FARMER_COLORS.primaryLight,
    },
    {
      id: 'Staff',
      name: t('role_staff'),
      desc: t('role_staff_desc'),
      icon: '🚜',
      bgColor: STAFF_COLORS.primaryLight,
    },
    {
      id: 'Retailer',
      name: t('role_fpo'),
      desc: t('role_fpo_desc'),
      icon: '🏪',
      bgColor: FPO_COLORS.primaryLight,
    },
  ];

  const selectedRoleData = roles.find(r => r.id === selectedRole);
  const activeColor = selectedRoleData
    ? selectedRoleData.bgColor
    : STAFF_COLORS.primary;

  const handleContinue = async () => {
    if (!selectedRole) return;

    // save selected role
    await setUserData(selectedRole);
    console.log('selectedRole', selectedRole);

    // role-based navigation
    if (selectedRole === 'Farmer') {
      navigation.navigate('Login', { roleId: 'Farmer' });
      return;
    }

    if (selectedRole === 'Staff') {
      navigation.navigate('StafLogin', { roleId: 'Staff' });
      return;
    }

    if (selectedRole === 'Retailer') {
      navigation.navigate('FPOLogin', { roleId: 'Retailer' });
      return;
    }
  };

  // const handleContinue =
  //  async () => {
  //   if (!selectedRole) return;

  //   // save selected role
  //   await setUserData(selectedRole);

  //   // ONLY ONE LOGIN SCREEN
  //   navigation.navigate("Login", { roleId: selectedRole });
  // };

  const handleRoleSelect = roleId => {
    setSelectedRole(roleId);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Text style={styles.title}>{t('role_welcome')}</Text>
      <Text style={styles.subtitle}>{t('role_subtitle')}</Text>

      {/* ROLE OPTIONS */}
      {roles.map(role => (
        <TouchableOpacity
          key={role.id}
          style={[
            styles.optionBox,
            selectedRole === role.id && {
              borderColor: role.bgColor,
              backgroundColor: `${role.bgColor}15`, // adding some transparency for active bg
            },
          ]}
          onPress={() => handleRoleSelect(role.id)}
          activeOpacity={0.7}
        >
          <View style={styles.leftContent}>
            {/* ICON WITH COLOR BACKGROUND */}
            <View style={[styles.iconBox, { backgroundColor: role.bgColor }]}>
              <Text style={styles.icon}>{role.icon}</Text>
            </View>

            <View>
              <Text
                style={[
                  styles.optionText,
                  selectedRole === role.id && { color: role.bgColor },
                ]}
              >
                {role.name}
              </Text>
              <Text style={styles.optionDesc}>{role.desc}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* CONTINUE BUTTON */}
      <TouchableOpacity
        style={[
          styles.continueButton,
          selectedRole
            ? { backgroundColor: activeColor }
            : styles.disabledContinueButton,
        ]}
        onPress={handleContinue}
        activeOpacity={selectedRole ? 0.7 : 1}
        disabled={!selectedRole}
      >
        <Text
          style={[
            styles.continueText,
            !selectedRole && styles.disabledContinueText,
          ]}
        >
          {t('continue')}
        </Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>{t('role_footer')}</Text>
    </View>
  );
};

export default Roll;

const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 22,
    paddingTop: 40,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },

  optionBox: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBox: {
    height: 48,
    width: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  icon: {
    fontSize: 26,
  },

  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  optionDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },

  continueButton: {
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  disabledContinueButton: {
    backgroundColor: '#D1D5DB',
  },

  continueText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  disabledContinueText: {
    color: '#9CA3AF',
  },

  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 12,
  },
});
