import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    Dimensions,
    ActivityIndicator,
    Share,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import apiService from '../../../Redux/apiService';
import { FARMER_COLORS } from '../../../colorsList/ColorList';

const { width } = Dimensions.get('window');

const BroadcastDetailsScreen = ({ route, navigation }) => {
    const { t } = useTranslation();
    const { broadcastId, title, description, image, timestamp } =
        route.params || {};

    const [broadcast, setBroadcast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // If data was passed directly (e.g. from FCM notification), use it
        if (title && description) {
            setBroadcast({ title, description, image, sentAt: timestamp });
            setLoading(false);
        }
        // Otherwise fetch from API using broadcastId
        else if (broadcastId) {
            fetchBroadcastDetails();
        } else {
            setLoading(false);
        }
    }, [broadcastId]);

    const fetchBroadcastDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getBroadcastById(broadcastId);

            if (response?.success) {
                setBroadcast(response.data);
            }
        } catch (error) {
            console.error('❌ Error fetching broadcast details:', error);
            if (error?.response?.status === 403) {
                setError(error.response.data.message || t('broadcasts.access_denied'));
            } else {
                setError(t('broadcasts.load_failed'));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `${broadcast.title}\n\n${broadcast.description}${broadcast.image ? `\n\nImage: ${broadcast.image}` : ''
                    }`,
            });
        } catch (error) {
            console.error('❌ Error sharing:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={FARMER_COLORS.primaryLight} />
            </View>
        );
    }

    if (error || !broadcast) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error || t('broadcasts.not_found')}</Text>
                <TouchableOpacity
                    style={styles.backButtonInline}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>{t('broadcasts.go_back')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const getImageUrl = (img) => {
        if (!img) return null;
        if (typeof img === 'string') {
            if (img.startsWith('http')) return img;
            try {
                const parsed = JSON.parse(img);
                return parsed?.url || img;
            } catch (e) {
                return img; // Return the plain string if it's not JSON
            }
        }
        if (typeof img === 'object') return img.url || null;
        return null;
    };

    const imageUrl = getImageUrl(broadcast.image);

    /* ================= HELPERS ================= */
    const formatFullDate = dateString => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString(t('i18n_locale') || 'en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={FARMER_COLORS.primary} translucent={false} />
            
            {/* Gradient Header */}
            <LinearGradient
                colors={[FARMER_COLORS.primary, FARMER_COLORS.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientHeader}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Icon name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>{t('broadcasts.detail_title', 'Broadcast Details')}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.shareBtn}
                        onPress={handleShare}
                        activeOpacity={0.7}
                    >
                        <Icon name="share-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false}>
                {imageUrl && (
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                )}

                <View style={styles.content}>
                    <Text style={styles.title}>{broadcast.title}</Text>
                    <Text style={styles.timestamp}>
                        {formatFullDate(broadcast.sentAt || broadcast.createdAt)}
                    </Text>

                    <View style={styles.divider} />

                    <Text style={styles.description}>{broadcast.description}</Text>
                </View>
            </ScrollView>
        </View>
    );
};

/* ================= STYLES ================= */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F6F8',
    },
    /* GRADIENT HEADER */
    gradientHeader: {
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingBottom: 12,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    backBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#fff",
    },
    shareBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F4F6F8',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F4F6F8',
    },
    errorText: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 20,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    backButtonInline: {
        backgroundColor: '#1F2937',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },

    /* ── Content ── */
    image: {
        width: width,
        height: 250,
        backgroundColor: '#e0e0e0',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        marginTop: 16,
    },
    content: {
        padding: 24,
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        marginBottom: 40,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 10,
        lineHeight: 30,
    },
    timestamp: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginBottom: 20,
    },
    description: {
        fontSize: 16,
        lineHeight: 26,
        color: '#4B5563',
    },
});

export default BroadcastDetailsScreen;
