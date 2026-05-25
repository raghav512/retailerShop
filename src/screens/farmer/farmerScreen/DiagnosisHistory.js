import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  StatusBar,
} from 'react-native';
import { showAlert } from '../../../common/reusableComponent/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../../../Redux/apiService';
import { API_BASE_URL } from '../../../config';
import { FARMER_COLORS } from '../../../colorsList/ColorList';

const { width } = Dimensions.get('window');

// Responsive font size calculation
const RFValue = fontSize => {
  const standardScreenWidth = 375;
  const scale = width / standardScreenWidth;
  return Math.round(fontSize * scale);
};

// ✅ Extract disease name from diagnosis text
const extractDiseaseName = diagnosis => {
  if (!diagnosis) return 'Unknown Disease';

  // Try multiple patterns to extract disease name (English and Hindi)
  const patterns = [
    /DISEASE NAME:\s*\n([^\n]+)/i,
    /DISEASE NAME:\s*([^\n]+)/i,
    /Disease:\s*([^\n]+)/i,
    /Disease Name:\s*([^\n]+)/i,
    /रोग का नाम:\s*\n([^\n]+)/i, // Hindi: Disease Name
    /रोग का नाम:\s*([^\n]+)/i,
    /रोग:\s*([^\n]+)/i, // Hindi: Disease
  ];

  for (const pattern of patterns) {
    const match = diagnosis.match(pattern);
    if (match && match[1]) {
      const diseaseName = match[1].trim();
      // Remove any markdown or special characters
      return diseaseName.replace(/[*#_]/g, '').trim();
    }
  }

  // If no pattern matches, try to get first non-empty line
  const lines = diagnosis.split('\n').filter(line => line.trim());
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    // Skip if it's a header line
    if (!firstLine.includes(':') && firstLine.length < 100) {
      return firstLine.replace(/[*#_]/g, '').trim();
    }
    // Try second line
    if (lines.length > 1) {
      const secondLine = lines[1].trim();
      if (!secondLine.includes(':') && secondLine.length < 100) {
        return secondLine.replace(/[*#_]/g, '').trim();
      }
    }
  }

  return 'Unknown Disease';
};

// ✅ Parse diagnosis text into structured sections (supports English and Hindi)
const parseDiagnosis = text => {
  const sections = {
    diseaseName: '',
    symptoms: [],
    causes: [],
    treatment: [],
    chemicals: [],
    fertilizers: [],
    organicAlternatives: [],
    prevention: [],
  };

  if (!text) return sections;

  const lines = text.split('\n');
  let currentSection = '';

  lines.forEach(line => {
    const trimmed = line.trim().replace(/[*#_]/g, ''); // Remove markdown

    // English and Hindi section headers
    if (trimmed.match(/DISEASE NAME|रोग का नाम/i)) {
      currentSection = 'diseaseName';
    } else if (trimmed.match(/SYMPTOMS|लक्षण/i)) {
      currentSection = 'symptoms';
    } else if (trimmed.match(/CAUSES|कारण/i)) {
      currentSection = 'causes';
    } else if (trimmed.match(/TREATMENT|उपचार/i)) {
      currentSection = 'treatment';
    } else if (
      trimmed.match(/RECOMMENDED CHEMICALS|CHEMICALS|अनुशंसित रसायन|रसायन/i)
    ) {
      currentSection = 'chemicals';
    } else if (
      trimmed.match(
        /RECOMMENDED FERTILIZERS|FERTILIZERS|अनुशंसित उर्वरक|उर्वरक/i,
      )
    ) {
      currentSection = 'fertilizers';
    } else if (
      trimmed.match(/ORGANIC ALTERNATIVES|ORGANIC|जैविक विकल्प|जैविक/i)
    ) {
      currentSection = 'organicAlternatives';
    } else if (trimmed.match(/PREVENTION|रोकथाम/i)) {
      currentSection = 'prevention';
    } else if (trimmed && !trimmed.includes(':')) {
      if (currentSection === 'diseaseName' && trimmed) {
        sections.diseaseName = trimmed;
      } else if (currentSection && sections[currentSection]) {
        if (Array.isArray(sections[currentSection])) {
          sections[currentSection].push(trimmed);
        }
      }
    }
  });

  return sections;
};

export default function DiagnosisHistory({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const getUserId = async () => {
      try {
        // First try to get from userData key
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          const id = userData.id || userData._id;
          setUserId(id);
          if (id) fetchHistory(id);
          return;
        }

        // Fallback to user key
        const userString = await AsyncStorage.getItem('user');
        if (userString) {
          const userObj = JSON.parse(userString);
          const id = userObj.id || userObj._id;
          setUserId(id);
          if (id) fetchHistory(id);
          return;
        }

        // Final fallback to direct userId
        const directId = await AsyncStorage.getItem('userId');
        setUserId(directId);
        if (directId) fetchHistory(directId);
      } catch (error) {
        console.error('Error getting userId:', error);
      }
    };

    getUserId();
  }, []);

  const fetchHistory = async uid => {
    try {
      setLoading(true);

      const response = await apiService.getUserReports(uid);
      console.log('API Response:', response);

      if (response.status === 'success') {
        const transformedData = (response.data || []).map(item => {
          let imageUrl = null;

          if (item.image) {
            if (typeof item.image === 'object') {
              imageUrl = item.image.url || null;
            } else if (typeof item.image === 'string') {
              if (item.image.startsWith('http')) {
                imageUrl = item.image;
              } else if (item.image.startsWith('data:image')) {
                imageUrl = item.image;
              }
            }
          }

          return {
            _id: item._id,
            userId: item.userId,
            imageUrl: imageUrl,
            diagnosis: item.diagnosis,
            diseaseName: extractDiseaseName(item.diagnosis),
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          };
        });

        setHistory(transformedData);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error('Error fetching history:', error.message);

      if (error.response?.status === 404) {
        setHistory([]);
      } else if (error.response?.status === 401) {
        showAlert({
          type: 'warning',
          title: 'Session Expired',
          message: 'Please login again',
        });
      } else {
        showAlert({
          type: 'error',
          title: 'Error',
          message: error.response?.data?.message || 'Failed to load history',
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (userId) fetchHistory(userId);
  };

  const handleDelete = (reportId, diseaseName) => {
    showAlert({
      type: 'confirm',
      title: 'Delete Report',
      message: `Are you sure you want to delete "${diseaseName}" diagnosis?`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteReport(reportId);
              setHistory(history.filter(item => item._id !== reportId));
              if (expandedId === reportId) setExpandedId(null);
              showAlert({
                type: 'success',
                title: 'Success',
                message: 'Report deleted successfully',
              });
            } catch (error) {
              console.error('Delete error:', error);
              if (error.response?.status === 401) {
                showAlert({
                  type: 'warning',
                  title: 'Session Expired',
                  message: 'Please login again',
                });
              } else {
                showAlert({
                  type: 'error',
                  title: 'Error',
                  message:
                    error.response?.data?.message || 'Failed to delete report',
                });
              }
            }
          },
        },
      ],
    });
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  };

  const toggleExpand = id => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderSection = (title, icon, iconColor, content, isList = false) => {
    if (!content || (Array.isArray(content) && content.length === 0))
      return null;

    return (
      <View style={styles.detailSection}>
        <View style={styles.detailSectionHeader}>
          <View
            style={[
              styles.detailIconBox,
              { backgroundColor: iconColor + '20' },
            ]}
          >
            {icon}
          </View>
          <Text style={styles.detailSectionTitle}>{title}</Text>
        </View>

        {isList ? (
          content.map((item, index) => (
            <View key={index} style={styles.detailListItem}>
              <View
                style={[styles.detailBullet, { backgroundColor: iconColor }]}
              />
              <Text style={styles.detailListText}>{item}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.detailContentText}>{content}</Text>
        )}
      </View>
    );
  };

  const renderItem = ({ item, index }) => {
    const isExpanded = expandedId === item._id;
    const sections = isExpanded ? parseDiagnosis(item.diagnosis) : null;

    const hasValidImage =
      item.imageUrl &&
      typeof item.imageUrl === 'string' &&
      item.imageUrl.startsWith('http');

    return (
      <View style={[styles.card, { marginTop: index === 0 ? 0 : 16 }]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => toggleExpand(item._id)}
        >
          <View style={styles.imageContainer}>
            {hasValidImage ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.cardImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.cardImage, styles.noImageContainer]}>
                <Ionicons name="image-outline" size={50} color="#999" />
                <Text style={styles.noImageText}>No Image Available</Text>
              </View>
            )}
            <View style={styles.dateOverlay}>
              <View style={styles.imageFooter}>
                <View style={styles.dateContainer}>
                  <Ionicons
                    name="calendar-outline"
                    size={14}
                    color={FARMER_COLORS.primaryLight}
                  />
                  <Text style={styles.dateText}>
                    {formatDate(item.createdAt)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.diseaseRow}>
              <View style={styles.diseaseIconBox}>
                <MaterialCommunityIcons
                  name="leaf"
                  size={20}
                  color={FARMER_COLORS.primaryLight}
                />
              </View>
              <View style={styles.diseaseInfo}>
                <Text style={styles.diseaseName} numberOfLines={2}>
                  {item.diseaseName}
                </Text>
                <Text style={styles.subtitle}>
                  {isExpanded ? 'Tap to collapse' : 'Tap to view full report'}
                </Text>
              </View>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={FARMER_COLORS.primaryLight}
              />
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && sections && (
          <View style={styles.expandedContent}>
            {renderSection(
              'Symptoms',
              <Ionicons name="warning" size={20} color="#ff9800" />,
              '#ff9800',
              sections.symptoms,
              true,
            )}
            {renderSection(
              'Causes',
              <MaterialCommunityIcons
                name="help-circle"
                size={20}
                color="#9c27b0"
              />,
              '#9c27b0',
              sections.causes,
              true,
            )}
            {renderSection(
              'Treatment',
              <MaterialCommunityIcons
                name="medical-bag"
                size={20}
                color={FARMER_COLORS.primaryLight}
              />,
              FARMER_COLORS.primaryLight,
              sections.treatment,
              true,
            )}
            {renderSection(
              'Recommended Chemicals',
              <MaterialCommunityIcons name="flask" size={20} color="#2196f3" />,
              '#2196f3',
              sections.chemicals,
              true,
            )}
            {renderSection(
              'Recommended Fertilizers',
              <MaterialCommunityIcons
                name="flower"
                size={20}
                color="#00bcd4"
              />,
              '#00bcd4',
              sections.fertilizers,
              true,
            )}
            {renderSection(
              'Organic Alternatives',
              <MaterialCommunityIcons name="leaf" size={20} color="#8bc34a" />,
              '#8bc34a',
              sections.organicAlternatives,
              true,
            )}
            {renderSection(
              'Prevention',
              <Ionicons
                name="shield-checkmark"
                size={20}
                color={FARMER_COLORS.primaryLight}
              />,
              FARMER_COLORS.primaryLight,
              sections.prevention,
              true,
            )}

            <TouchableOpacity
              style={styles.deleteButtonExpanded}
              onPress={() => handleDelete(item._id, item.diseaseName)}
            >
              <Ionicons name="trash-outline" size={20} color="#fff" />
              <Text style={styles.deleteButtonText}>Delete Report</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isExpanded && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => toggleExpand(item._id)}
            >
              <Ionicons
                name="eye-outline"
                size={18}
                color={FARMER_COLORS.primaryLight}
              />
              <Text style={styles.viewButtonText}>View Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item._id, item.diseaseName)}
            >
              <Ionicons name="trash-outline" size={18} color="#ff4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={FARMER_COLORS.primaryLight} />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <MaterialCommunityIcons
              name="folder-open-outline"
              size={80}
              color={FARMER_COLORS.primaryLight}
            />
          </View>
          <Text style={styles.emptyTitle}>No Reports Yet</Text>
          <Text style={styles.emptySubtext}>
            Your saved crop diagnoses will appear here.{'\n'}
            Start by analyzing a leaf image!
          </Text>

          <TouchableOpacity
            style={styles.emptyActionButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="leaf-circle" size={22} color="#fff" />
            <Text style={styles.emptyActionText}>Analyze Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{history.length}</Text>
              <Text style={styles.statLabel}>Total Reports</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {new Set(history.map(item => item.diseaseName)).size}
              </Text>
              <Text style={styles.statLabel}>Unique Diseases</Text>
            </View>
          </View>

          <FlatList
            data={history}
            renderItem={renderItem}
            keyExtractor={item => item._id}
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
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
  },
  noImageContainer: {
    backgroundColor: '#e8e8e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#999',
    marginTop: 10,
    fontSize: RFValue(14),
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f8fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: FARMER_COLORS.primaryLight,
  },
  refreshButton: {
    padding: 8,
    marginRight: -8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: RFValue(16),
    color: '#888',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#e8f4f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  emptyTitle: {
    fontSize: RFValue(24),
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: RFValue(15),
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FARMER_COLORS.primaryLight,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    gap: 8,
  },
  emptyActionText: {
    color: '#fff',
    fontSize: RFValue(16),
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: RFValue(28),
    fontWeight: '700',
    color: FARMER_COLORS.primaryLight,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: RFValue(13),
    color: '#888',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e8e8e8',
    marginHorizontal: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  dateOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  imageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  dateText: {
    color: FARMER_COLORS.primaryLight,
    fontSize: RFValue(12),
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  diseaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  diseaseIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e8f4f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  diseaseInfo: {
    flex: 1,
  },
  diseaseName: {
    fontSize: RFValue(17),
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: RFValue(13),
    color: '#888',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f4f5',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  viewButtonText: {
    color: FARMER_COLORS.primaryLight,
    fontSize: RFValue(15),
    fontWeight: '600',
  },
  deleteButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffebee',
    borderRadius: 12,
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
  },
  detailSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  detailSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  detailSectionTitle: {
    fontSize: RFValue(15),
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  detailContentText: {
    fontSize: RFValue(14),
    color: '#555',
    lineHeight: 22,
  },
  detailListItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    marginRight: 10,
  },
  detailListText: {
    fontSize: RFValue(14),
    color: '#555',
    lineHeight: 22,
    flex: 1,
  },
  deleteButtonExpanded: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff4444',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: RFValue(15),
    fontWeight: '600',
  },
});
