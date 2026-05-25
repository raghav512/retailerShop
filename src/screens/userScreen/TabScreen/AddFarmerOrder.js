import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import apiService from '../../../Redux/apiService';
import { useTranslation } from 'react-i18next';
import { STAFF_COLORS } from '../../../colorsList/ColorList';
import { showAlert } from '../../../common/reusableComponent/CustomAlert';

const AddFarmerOrder = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [farmers, setFarmers] = useState([]);
  const [filteredFarmers, setFilteredFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchFarmers();
    }, []),
  );

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      console.log('📋 Fetching all farmers...');
      const response = await apiService.getAllFarmers();
      console.log('✅ Farmers fetched:', response);

      const farmersList = Array.isArray(response)
        ? response
        : response?.data || [];
      setFarmers(farmersList);
      setFilteredFarmers(farmersList);
    } catch (error) {
      console.error('❌ Failed to fetch farmers:', error);
      showAlert({
        type: 'error',
        title: t('error'),
        message: 'Failed to load farmers',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredFarmers(farmers);
    } else {
      const searchLower = search.toLowerCase();
      const filtered = farmers.filter(farmer => {
        const firstName = (farmer.firstName || '').toLowerCase();
        const lastName = (farmer.lastName || '').toLowerCase();
        const phone = (farmer.phone || '').toLowerCase();
        const fullName = `${firstName} ${lastName}`.trim();

        fullName.includes(searchLower) ||
          firstName.includes(searchLower) ||
          lastName.includes(searchLower) ||
          phone.includes(searchLower);
      });
      setFilteredFarmers(filtered);
    }
  }, [search, farmers]);

  const handleSelectFarmer = farmer => {
    console.log('FARMER SELECTION:', {
      id: farmer?._id,
      name: `${farmer.firstName || ''} ${farmer.lastName || ''}`.trim(),
      phone: farmer?.phone,
      role: farmer?.role,
    });

    const selectedFarmerId = farmer._id;
    const selectedFarmerName = `${farmer.firstName || ''} ${
      farmer.lastName || ''
    }`.trim();

    navigation.navigate('MarketPlace', {
      isStaffOrder: true,
      selectedFarmerId,
      selectedFarmerData: farmer,
      selectedFarmerName,
    });
  };

  const renderFarmer = ({ item }) => {
    const farmerName =
      `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'N/A';
    const phone = item.phone || 'N/A';

    return (
      <TouchableOpacity
        style={styles.farmerCard}
        activeOpacity={0.7}
        onPress={() => handleSelectFarmer(item)}
      >
        <View style={styles.farmerIcon}>
          <Icon name="person" size={28} color={STAFF_COLORS.primary} />
        </View>

        <View style={styles.farmerInfo}>
          <Text style={styles.farmerName}>{farmerName}</Text>
          <View style={styles.farmerMeta}>
            <Icon name="call" size={14} color={STAFF_COLORS.textSecondary} />
            <Text style={styles.farmerPhone}>{phone}</Text>
          </View>
        </View>

        <View style={styles.arrowContainer}>
          <Icon
            name="chevron-forward"
            size={20}
            color={STAFF_COLORS.textSecondary}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={STAFF_COLORS.primary}
        translucent={false}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color={STAFF_COLORS.textOnPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Farmer</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon
          name="search"
          size={20}
          color={STAFF_COLORS.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Search by name or phone..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={STAFF_COLORS.textSecondary}
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon name="close-circle" size={20} color={STAFF_COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={STAFF_COLORS.primary} />
          <Text style={styles.loadingText}>Loading farmers...</Text>
        </View>
      ) : filteredFarmers.length > 0 ? (
        <FlatList
          data={filteredFarmers}
          keyExtractor={item => item._id}
          renderItem={renderFarmer}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Icon name="people" size={64} color={STAFF_COLORS.primaryLight} />
          </View>
          <Text style={styles.emptyText}>
            {search ? 'No farmers found' : 'No farmers available'}
          </Text>
          <Text style={styles.emptySubText}>
            {search ? 'Try a different search term' : 'Add farmers to get started'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: STAFF_COLORS.background,
  },
  header: {
    backgroundColor: STAFF_COLORS.primary,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: STAFF_COLORS.primaryDark,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  headerTitle: {
    color: STAFF_COLORS.textOnPrimary,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: STAFF_COLORS.surface,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: STAFF_COLORS.tintMid,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: STAFF_COLORS.textPrimary,
    fontWeight: '500',
  },
  listContent: {
    padding: 20,
    paddingBottom: 30,
  },
  farmerCard: {
    backgroundColor: STAFF_COLORS.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: STAFF_COLORS.tintMid,
  },
  farmerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: STAFF_COLORS.tintCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: STAFF_COLORS.primary,
  },
  farmerInfo: {
    flex: 1,
  },
  farmerName: {
    fontSize: 16,
    fontWeight: '700',
    color: STAFF_COLORS.textPrimary,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  farmerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  farmerPhone: {
    fontSize: 14,
    color: STAFF_COLORS.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: STAFF_COLORS.tintCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: STAFF_COLORS.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: STAFF_COLORS.tintCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: STAFF_COLORS.tintMid,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: STAFF_COLORS.textPrimary,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  emptySubText: {
    fontSize: 13,
    color: STAFF_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.1,
  },
});

export default AddFarmerOrder;
