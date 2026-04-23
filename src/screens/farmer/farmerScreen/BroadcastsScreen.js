import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
    Dimensions,
    StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import apiService from '../../../Redux/apiService';
import { FARMER_COLORS } from '../../../colorsList/ColorList';

const { width } = Dimensions.get('window');

const BroadcastsScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [broadcasts, setBroadcasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        fetchBroadcasts();
    }, []);

    const fetchBroadcasts = async (pageNum = 1, isRefresh = false) => {
        try {
            if (pageNum === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const response = await apiService.getAllBroadcasts(pageNum, 20);

            if (response?.success) {
                const newBroadcasts = response.data || [];
                const { pages, page: currentPage } = response.pagination || {};

                if (isRefresh || pageNum === 1) {
                    setBroadcasts(newBroadcasts);
                } else {
                    setBroadcasts(prev => [...prev, ...newBroadcasts]);
                }

                setHasMore(currentPage < pages);
                setPage(pageNum);
            }
        } catch (error) {
            console.error('❌ Error fetching broadcasts:', error);
            // Stop infinite scrolling if the API is failing
            setHasMore(false);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchBroadcasts(1, true);
    }, []);

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            fetchBroadcasts(page + 1);
        }
    };

    /* ================= HELPERS ================= */
    const formatDate = dateString => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) {
            return `${diffMins} ${t(`broadcasts.time.min${diffMins !== 1 ? 's' : ''}`)} ${t('broadcasts.time.ago')}`;
        } else if (diffHours < 24) {
            return `${diffHours} ${t(`broadcasts.time.hour${diffHours !== 1 ? 's' : ''}`)} ${t('broadcasts.time.ago')}`;
        } else if (diffDays < 7) {
            return `${diffDays} ${t(`broadcasts.time.day${diffDays !== 1 ? 's' : ''}`)} ${t('broadcasts.time.ago')}`;
        } else {
            return date.toLocaleDateString(t('i18n_locale') || 'en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
            });
        }
    };

    const capitalize = str =>
        str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    const renderBroadcastItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() =>
                navigation.navigate('BroadcastDetails', { broadcastId: item._id })
            }
            activeOpacity={0.7}>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.title}
                </Text>

                <Text style={styles.cardDescription} numberOfLines={3}>
                    {item.description}
                </Text>

                <View style={styles.cardFooter}>
                    <Text style={styles.cardDate}>
                        {formatDate(item.sentAt || item.createdAt)}
                    </Text>

                    {item.targetRole && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {item.targetRole.toLowerCase() === 'all'
                                    ? t('broadcasts.for_everyone')
                                    : t('broadcasts.for_role', { role: t(`role_${item.targetRole.toLowerCase()}`) })}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('broadcasts.no_broadcasts')}</Text>
            <Text style={styles.emptySubText}>
                {t('broadcasts.empty_subtitle')}
            </Text>
        </View>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={FARMER_COLORS.primaryLight} />
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={FARMER_COLORS.primaryLight} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
            
            {/* Header */}
            <View style={styles.headerSpacer} />
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Icon name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('broadcasts.title', 'Broadcasts')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={broadcasts}
                renderItem={renderBroadcastItem}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[FARMER_COLORS.primaryLight]}
                    />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

/* ================= STYLES ================= */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F6F8',
    },
    headerSpacer: {
        height: 6,
        backgroundColor: "#ffffff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: "#ffffff",
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        elevation: 8,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 5 },
        zIndex: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1F2937",
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F4F6F8',
    },
    listContent: {
        padding: 16,
        paddingBottom: 24,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
    },
    cardImage: {
        width: '100%',
        height: 180,
        backgroundColor: '#e0e0e0',
    },
    cardContent: {
        padding: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardDate: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
    badge: {
        backgroundColor: '#FEF9E7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 11,
        color: FARMER_COLORS.primaryLight,
        fontWeight: '700',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#424242',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: '#757575',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});

export default BroadcastsScreen;
