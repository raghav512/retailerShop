import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TextInput,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import apiService from '../../../Redux/apiService';

import { STAFF_COLORS } from '../../../colorsList/ColorList';

/* ---------------- DUMMY DATA (API READY) ---------------- */

/* ---------------- SCREEN ---------------- */

const Visits = () => {
  const [farmers, setFarmers] = useState([]);
  const [search, setSearch] = useState('');
  const { t } = useTranslation();
  const navigation = useNavigation();

  const fetchFarmers = async () => {
    try {
      const response = await apiService.getAllFarmers();
      console.log('BACKEND FARMERS 👉', response);

      const farmersList = response?.data || response || [];

      const mappedFarmers = farmersList.map(item => {
        const firstName = item.firstName?.trim() || '';
        const lastName = item.lastName?.trim() || '';
        const fullName = `${firstName} ${lastName}`.trim();

        return {
          id: item._id,
          name: fullName || 'Name Not Updated',
          phone: item.phone || 'N/A',
          verified: true,
        };
      });

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

  /* ---------------- FILTER (API READY) ---------------- */

  const filteredFarmers = farmers.filter(item =>
    item.name?.toLowerCase().includes(search.toLowerCase()),
  );

  /* ---------------- RENDER ITEM ---------------- */

  const renderItem = ({ item }) => {

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Icon name="person" size={26} color="#fff" />
            </View>
            {item.verified && (
              <View style={styles.verifiedBadgeSmall}>
                <Icon name="checkmark-circle" size={16} color="#10B981" />
              </View>
            )}
          </View>

          <View style={styles.farmerDetails}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <View style={styles.infoRow}>
              <View style={styles.phoneIconBox}>
                <Icon name="call" size={12} color={STAFF_COLORS.primary} />
              </View>
              <Text style={styles.phone}>{item.phone}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={STAFF_COLORS.primary}
        translucent={false}
      />

      {/* HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t('farmers.title')}</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() =>
              navigation.navigate('Screen1', {
                themeColor: STAFF_COLORS.primary,
              })
            }
            activeOpacity={0.7}
          >
            <Icon name="person-add-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Icon name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            placeholder={t('farmers.search')}
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* LIST */}
      <View style={styles.container}>
        <FlatList
          data={filteredFarmers}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </SafeAreaView>
  );
};

export default Visits;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  /* HEADER */
  headerContainer: {
    backgroundColor: STAFF_COLORS.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingBottom: 16,
    elevation: 8,
    shadowColor: STAFF_COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },

  /* SEARCH */
  searchContainer: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 18,
    height: 54,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  searchInput: {
    flex: 1,
    color: '#1F2937',
    marginLeft: 14,
    fontSize: 15,
    fontWeight: '400',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 18,
    paddingTop: 6,
  },

  /* CARD */
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    marginBottom: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 0.5,
    borderColor: '#F3F4F6',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: STAFF_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: STAFF_COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  verifiedBadgeSmall: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 3,
    elevation: 4,
    shadowColor: '#10B981',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  farmerDetails: {
    flex: 1,
    gap: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: 0.2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phoneIconBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phone: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
});
