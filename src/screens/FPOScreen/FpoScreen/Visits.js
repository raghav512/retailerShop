import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import apiService from '../../../Redux/apiService';
import { FPO_COLORS } from '../../../colorsList/ColorList';

const THEME = FPO_COLORS.primary;

const Visits = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [farmers, setFarmers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchFarmers = async () => {
    try {
      const response = await apiService.getAllFarmers();
      console.log('👥 Farmers API Response:', JSON.stringify(response, null, 2));
      const mappedFarmers = await Promise.all(
        response.map(async item => {
          let orderCount = 0;
          try {
            const ordersResponse = await apiService.getFarmerOrders(item._id);
            const ordersData = ordersResponse?.data || ordersResponse || [];
            orderCount = Array.isArray(ordersData) ? ordersData.length : 0;
          } catch (_) {}
          
          const firstName = item.firstName?.trim() || '';
          const lastName = item.lastName?.trim() || '';
          const fullName = `${firstName} ${lastName}`.trim();
          
          return {
            id: item._id,
            name: fullName || 'Unknown Farmer',
            phone: item.phone || 'N/A',
            orders: orderCount,
            status: 'verified',
          };
        }),
      );
      setFarmers(mappedFarmers);
    } catch (error) {
      console.log('Farmer API error 👉', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFarmers();
    }, []),
  );

  const filteredFarmers = useMemo(() => {
    return farmers.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' ? true : f.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [farmers, search, filter]);

  const renderFarmer = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('FarmerDetails', { id: item.id })}
      activeOpacity={0.8}
    >
      {/* Avatar */}
      <View style={styles.cardAvatar}>
        <Text style={styles.cardAvatarText}>
          {item.name?.[0]?.toUpperCase() || 'F'}
        </Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <View
            style={[
              styles.statusBadge,
              item.status === 'verified' ? styles.verified : styles.pending,
            ]}
          >
            <Icon
              name={item.status === 'verified' ? 'checkmark-circle' : 'time'}
              size={11}
              color={item.status === 'verified' ? '#059669' : '#DC2626'}
            />
            <Text
              style={[
                styles.statusText,
                item.status === 'verified'
                  ? styles.verifiedText
                  : styles.pendingText,
              ]}
            >
              {' '}
              {t(`status.${item.status}`)}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Icon name="call-outline" size={13} color="#9CA3AF" />
          <Text style={styles.info}> {item.phone}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.fieldsPill}>
            <Icon name="cart-outline" size={12} color={THEME} />
            <Text style={styles.fieldsText}>
              {item.orders} {t('orders')}
            </Text>
          </View>
          <Icon name="chevron-forward" size={16} color="#D1D5DB" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={FPO_COLORS.primary}
        translucent={false}
      />

      {/* HEADER */}
      <LinearGradient
        colors={[FPO_COLORS.primary, FPO_COLORS.primaryDark, FPO_COLORS.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t('farmer_management')}</Text>
            <Text style={styles.headerSub}>
              {t('all_farmers_order_details')}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addFarmerBtn}
            onPress={() => navigation.navigate('Screen1', { themeColor: THEME })}
            activeOpacity={0.8}
          >
            <Icon name="person-add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* SEARCH + FILTERS */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <View style={styles.searchIconWrapper}>
            <Icon name="search-outline" size={20} color={THEME} />
          </View>
          <TextInput
            placeholder={t('search_farmers')}
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearch('')}
              style={styles.clearBtn}
              activeOpacity={0.7}
            >
              <Icon name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {['all', 'verified', 'pending'].map(type => (
            <TouchableOpacity
              key={type}
              onPress={() => setFilter(type)}
              activeOpacity={0.7}
              style={[
                styles.filterChip,
                filter === type && styles.filterChipActive,
              ]}
            >
              {filter === type && (
                <Icon name="checkmark-circle" size={14} color="#fff" style={styles.filterIcon} />
              )}
              <Text
                style={[
                  styles.filterText,
                  filter === type && styles.filterTextActive,
                ]}
              >
                {t(`filter.${type}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* LIST */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FlatList
          data={filteredFarmers}
          keyExtractor={item => item.id}
          renderItem={renderFarmer}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="people-outline" size={56} color="#D1D5DB" />
              <Text style={styles.emptyText}>No farmers found</Text>
            </View>
          }
        />
      </ScrollView>
    </View>
  );
};

export default Visits;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },

  /* HEADER */
  headerGradient: {
    paddingBottom: 12,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  addFarmerBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* SEARCH & FILTERS */
  searchSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    elevation: 1,
    shadowColor: THEME,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  searchIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EBF3F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: { 
    flex: 1, 
    color: '#1F2937', 
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 10,
  },
  clearBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterRow: { 
    flexDirection: 'row', 
    gap: 10,
    paddingVertical: 2,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  filterChipActive: { 
    backgroundColor: THEME, 
    borderColor: THEME,
    elevation: 2,
    shadowColor: THEME,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  filterIcon: {
    marginRight: -2,
  },
  filterText: { 
    fontSize: 13, 
    color: '#6B7280', 
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  filterTextActive: { 
    color: '#ffffff', 
    fontWeight: '800',
  },

  /* LIST */
  scrollContent: { padding: 16, paddingBottom: 40 },

  /* FARMER CARD */
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF3F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardAvatarText: { fontSize: 20, fontWeight: '800', color: THEME },
  cardBody: { flex: 1 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  verified: { backgroundColor: '#D1FAE5' },
  pending: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 11, fontWeight: '600' },
  verifiedText: { color: '#059669' },
  pendingText: { color: '#DC2626' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  info: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF3F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  fieldsText: { fontSize: 12, color: THEME, fontWeight: '600' },

  /* EMPTY */
  emptyContainer: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#9CA3AF' },
});
