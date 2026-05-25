import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { FARMER_COLORS } from '../../../colorsList/ColorList';
import apiService from '../../../Redux/apiService';

const ScreenFourth = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedFarms, setExpandedFarms] = useState({});

  const fetchAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await apiService.getCropAnalytics();
      const farmsData = response?.data || [];
      setData(Array.isArray(farmsData) ? farmsData : []);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAnalytics();
    }, []),
  );

  const onRefresh = useCallback(() => {
    fetchAnalytics(true);
  }, []);

  const toggleExpand = farmId => {
    setExpandedFarms(prev => ({
      ...prev,
      [farmId]: !prev[farmId],
    }));
  };

  const summaryData = useMemo(() => {
    const totalFarms = data.length;
    const totalCrops = data.reduce(
      (sum, farm) => sum + (farm.totalCrops || 0),
      0,
    );
    const totalArea = data.reduce(
      (sum, farm) => sum + (parseFloat(farm.farmArea) || 0),
      0,
    );
    return { totalFarms, totalCrops, totalArea };
  }, [data]);

  const formatDate = dateStr => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderSummaryCard = (title, value, unit, icon) => (
    <View style={styles.summaryCard}>
      <View style={styles.summaryIconWrapper}>
        <Icon name={icon} size={24} color={FARMER_COLORS.primaryLight} />
      </View>
      <Text style={styles.summaryValue}>
        {value}
        <Text style={styles.summaryUnit}>{unit}</Text>
      </Text>
      <Text style={styles.summaryTitle}>{title}</Text>
    </View>
  );

  const renderFarmCard = ({ item }) => {
    const isExpanded = expandedFarms[item._id];
    const hasCrops = item.cropsGrown && item.cropsGrown.length > 0;

    return (
      <View style={styles.farmCard}>
        <TouchableOpacity
          style={styles.farmHeader}
          onPress={() => toggleExpand(item._id)}
          activeOpacity={0.7}
        >
          <View style={styles.farmHeaderLeft}>
            <View style={styles.farmIconBadge}>
              <Icon
                name="business"
                size={20}
                color={FARMER_COLORS.primaryLight}
              />
            </View>
            <View style={styles.farmInfo}>
              <Text style={styles.farmName}>{item.farmName}</Text>
              <View style={styles.farmMetaRow}>
                <View style={styles.farmMetaItem}>
                  <Icon
                    name="resize"
                    size={12}
                    color={FARMER_COLORS.textSecondary}
                  />
                  <Text style={styles.farmArea}>
                    {item.farmArea} {item.unit}
                  </Text>
                </View>
                <View style={styles.farmMetaItem}>
                  <Icon
                    name="leaf"
                    size={12}
                    color={FARMER_COLORS.textSecondary}
                  />
                  <Text style={styles.farmCrops}>
                    {item.totalCrops === 0
                      ? t('crop_analytics.no_crops')
                      : `${item.totalCrops} ${
                          item.totalCrops > 1
                            ? t('crop_analytics.crops_plural')
                            : t('crop_analytics.crop')
                        }`}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.expandIconWrapper}>
            <Icon
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={FARMER_COLORS.primaryLight}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            {item.geojson && (
              <View style={styles.polygonSection}>
                <View style={styles.polygonIconBadge}>
                  <Icon
                    name="location"
                    size={14}
                    color={FARMER_COLORS.primaryLight}
                  />
                </View>
                <View style={styles.polygonInfo}>
                  <Text style={styles.polygonText}>
                    {t('crop_analytics.farm_boundary_mapped')}
                  </Text>
                  <Text style={styles.polygonPoints}>
                    {item.geojson?.geometry?.coordinates?.[0]?.length || 0}{' '}
                    {t('crop_analytics.points')}
                  </Text>
                </View>
              </View>
            )}

            {hasCrops ? (
              <View style={styles.cropsGrid}>
                {item.cropsGrown.map((crop, index) => (
                  <View key={crop._id || index} style={styles.cropCard}>
                    <View style={styles.cropHeader}>
                      <View style={styles.cropIconBadge}>
                        <Icon name="leaf" size={16} color="#fff" />
                      </View>
                      <Text style={styles.cropName}>{crop.cropName}</Text>
                    </View>
                    <View style={styles.cropDetails}>
                      <View style={styles.cropDetailRow}>
                        <Text style={styles.cropDetailLabel}>
                          {t('crop_analytics.variety')}
                        </Text>
                        <Text style={styles.cropDetailValue}>
                          {crop.variety || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.cropDetailRow}>
                        <Text style={styles.cropDetailLabel}>
                          {t('crop_analytics.area')}
                        </Text>
                        <Text style={styles.cropDetailValue}>
                          {crop.area} {crop.unit}
                        </Text>
                      </View>
                      <View style={styles.cropDetailRow}>
                        <Text style={styles.cropDetailLabel}>
                          {t('crop_analytics.sowing')}
                        </Text>
                        <Text style={styles.cropDetailValue}>
                          {formatDate(crop.sowingDate)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyCropState}>
                <Icon
                  name="leaf-outline"
                  size={32}
                  color={FARMER_COLORS.textSecondary}
                />
                <Text style={styles.emptyCropText}>
                  {t('crop_analytics.no_crops_planted')}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrapper}>
        <Icon
          name="analytics-outline"
          size={48}
          color={FARMER_COLORS.primaryLight}
        />
      </View>
      <Text style={styles.emptyTitle}>{t('crop_analytics.no_farm_data')}</Text>
      <Text style={styles.emptySubtitle}>
        {t('crop_analytics.start_adding_farm')}
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.summaryContainer}>
        {renderSummaryCard(
          t('crop_analytics.farms'),
          summaryData.totalFarms,
          '',
          'business-outline',
        )}
        {renderSummaryCard(
          t('crop_analytics.crops'),
          summaryData.totalCrops,
          '',
          'leaf-outline',
        )}
        {renderSummaryCard(
          t('crop_analytics.area'),
          summaryData.totalArea.toFixed(1),
          ` ${t('crop_analytics.acre')}`,
          'resize-outline',
        )}
      </View>

      {data.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t('crop_analytics.your_farms')}
          </Text>
          <Text style={styles.sectionCount}>{data.length}</Text>
        </View>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <View style={styles.headerSpacer} />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon
              name="arrow-back"
              size={24}
              color={FARMER_COLORS.textOnPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('crop_analytics.title')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={FARMER_COLORS.primaryLight} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon
            name="arrow-back"
            size={24}
            color={FARMER_COLORS.textOnPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('crop_analytics.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={data}
        keyExtractor={item => item._id}
        renderItem={renderFarmCard}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[FARMER_COLORS.primaryLight]}
            tintColor={FARMER_COLORS.primaryLight}
          />
        }
      />
    </View>
  );
};

export default ScreenFourth;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF5',
  },
  headerSpacer: {
    height: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
    backgroundColor: FARMER_COLORS.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: FARMER_COLORS.textOnPrimary,
    letterSpacing: 0.5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerContent: {
    marginBottom: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: 'rgba(142, 171, 83, 0.08)',
    minHeight: 110,
  },
  summaryIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: FARMER_COLORS.primaryLight + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
    color: FARMER_COLORS.textPrimary,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  summaryUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: FARMER_COLORS.textSecondary,
  },
  summaryTitle: {
    fontSize: 11,
    color: FARMER_COLORS.textSecondary,
    marginTop: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: FARMER_COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '700',
    color: FARMER_COLORS.primaryLight,
    backgroundColor: FARMER_COLORS.primaryLight + '15',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  farmCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: 'rgba(142, 171, 83, 0.1)',
    overflow: 'hidden',
  },
  farmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
  },
  farmHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  farmIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: FARMER_COLORS.primaryLight + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  farmInfo: {
    flex: 1,
  },
  farmName: {
    fontSize: 17,
    fontWeight: '700',
    color: FARMER_COLORS.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  farmMetaRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  farmMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  farmArea: {
    fontSize: 13,
    color: FARMER_COLORS.textSecondary,
    fontWeight: '600',
    lineHeight: 18,
  },
  farmCrops: {
    fontSize: 13,
    color: FARMER_COLORS.textSecondary,
    fontWeight: '600',
    lineHeight: 18,
  },
  expandIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: FARMER_COLORS.primaryLight + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(142, 171, 83, 0.08)',
    padding: 18,
    backgroundColor: '#FAFBF8',
  },
  polygonSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(142, 171, 83, 0.1)',
  },
  polygonIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: FARMER_COLORS.primaryLight + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  polygonInfo: {
    flex: 1,
  },
  polygonText: {
    fontSize: 14,
    color: FARMER_COLORS.textPrimary,
    fontWeight: '700',
    marginBottom: 3,
    lineHeight: 18,
  },
  polygonPoints: {
    fontSize: 12,
    color: FARMER_COLORS.textSecondary,
    fontWeight: '500',
    lineHeight: 16,
  },
  cropsGrid: {
    gap: 12,
  },
  cropCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(142, 171, 83, 0.12)',
  },
  cropHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cropIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: FARMER_COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cropName: {
    fontSize: 16,
    fontWeight: '700',
    color: FARMER_COLORS.textPrimary,
    letterSpacing: -0.2,
    lineHeight: 20,
    flex: 1,
  },
  cropDetails: {
    gap: 10,
  },
  cropDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cropDetailLabel: {
    fontSize: 13,
    color: FARMER_COLORS.textSecondary,
    fontWeight: '500',
    lineHeight: 18,
  },
  cropDetailValue: {
    fontSize: 13,
    color: FARMER_COLORS.textPrimary,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'right',
  },
  emptyCropState: {
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyCropText: {
    fontSize: 14,
    color: FARMER_COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 32,
    backgroundColor: FARMER_COLORS.primaryLight + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    color: FARMER_COLORS.textPrimary,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptySubtitle: {
    fontSize: 14,
    color: FARMER_COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
});
