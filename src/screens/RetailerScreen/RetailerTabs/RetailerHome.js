import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../../common/reusableComponent/LanguageSwitcher';

import { RETAILER_COLORS, COLORS } from '../../../colorsList/ColorList';

const QUICK_ACTIONS = [
  {
    id: 'marketplace',
    titleKey: 'retailer_home.marketplace',
    subtitleKey: 'retailer_home.marketplace_sub',
    icon: 'basket-outline',
    route: 'RetailerMarketplace',
  },
  {
    id: 'orders',
    titleKey: 'retailer_home.my_orders',
    subtitleKey: 'retailer_home.my_orders_sub',
    icon: 'receipt-outline',
    route: 'RetailerOrders',
  },
  {
    id: 'inquiry',
    titleKey: 'retailer_home.inquiry',
    subtitleKey: 'retailer_home.inquiry_sub',
    icon: 'chatbox-outline',
    route: 'RetailerInquiry',
  },
  {
    id: 'documents',
    titleKey: 'retailer_home.documents',
    subtitleKey: 'retailer_home.documents_sub',
    icon: 'document-text-outline',
    route: 'RetailerDocuments',
  },
];

const RetailerHome = ({ navigation }) => {
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      // Refresh logic here if needed
    }, []),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{t('retailer_home.welcome_back')}</Text>
          <Text style={styles.title}>{t('retailer_home.dashboard_title')}</Text>
        </View>
        <View style={styles.headerRight}>
          <LanguageSwitcher iconColor={RETAILER_COLORS.textOnPrimary} style={styles.iconBtn} />
          <TouchableOpacity 
            style={styles.notificationBadge}
            onPress={() => navigation.navigate('BroadcastDetailsScreen')}
          >
            <Icon
              name="notifications"
              size={24}
              color={RETAILER_COLORS.textOnPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>{t('retailer_home.quick_actions')}</Text>

        <View style={styles.grid}>
          {QUICK_ACTIONS.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(item.route)}
            >
              <View style={styles.iconBox}>
                <Icon
                  name={item.icon}
                  size={28}
                  color={RETAILER_COLORS.primary}
                />
              </View>
              <Text style={styles.cardTitle}>{t(item.titleKey)}</Text>
              <Text style={styles.cardSubtitle}>{t(item.subtitleKey)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RetailerHome;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: RETAILER_COLORS.background,
    top: -30,
  },
  headerSpacer: {
    height: 0,
    backgroundColor: RETAILER_COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: RETAILER_COLORS.primaryLight,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 8,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
    color: RETAILER_COLORS.textSubOnPrimary,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: RETAILER_COLORS.textOnPrimary,
    letterSpacing: 0.3,
  },
  notificationBadge: {
    height: 44,
    width: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RETAILER_COLORS.textOnPrimary + '20',
    borderWidth: 1,
    borderColor: RETAILER_COLORS.textOnPrimary + '30',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: RETAILER_COLORS.textPrimary,
    marginBottom: 16,
    paddingHorizontal: 20,
    letterSpacing: 0.3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
    paddingHorizontal: 16,
  },
  card: {
    width: '48%',
    minHeight: 160,
    borderRadius: 16,
    backgroundColor: RETAILER_COLORS.surface,
    padding: 16,
    borderWidth: 1,
    borderColor: RETAILER_COLORS.primary,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: RETAILER_COLORS.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: RETAILER_COLORS.primary + '18',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: RETAILER_COLORS.textPrimary,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: RETAILER_COLORS.textSecondary,
    lineHeight: 18,
    fontWeight: '500',
  },
});
