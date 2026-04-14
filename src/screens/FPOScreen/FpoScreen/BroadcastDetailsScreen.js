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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import apiService from '../../../Redux/apiService';

const { width } = Dimensions.get('window');

const BroadcastDetailsScreen = ({ route, navigation }) => {
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
                setError(error.response.data.message || "You don't have access to this broadcast.");
            } else {
                setError("Failed to load broadcast. Please try again.");
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
                <ActivityIndicator size="large" color="#4CAF50" />
            </View>
        );
    }

    if (error || !broadcast) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error || "Broadcast not found"}</Text>
                <TouchableOpacity
                    style={styles.backButtonInline}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>Go Back</Text>
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

    return (
        <View style={styles.container}>
            {/* ── Custom Header ── */}
            <View style={styles.navHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-back" size={24} color="#212121" />
                </TouchableOpacity>
                <Text style={styles.navTitle} numberOfLines={1}>
                    Broadcast
                </Text>
            </View>

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

/* ================= HELPERS ================= */
const formatFullDate = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
  },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    errorText: {
        fontSize: 16,
        color: '#757575',
        marginBottom: 20,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    backButtonInline: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },

    /* ── Nav Header ── */
    navHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    backBtn: {
        padding: 4,
    },
    navTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: '600',
        color: '#212121',
        marginHorizontal: 8,
    },
    shareBtn: {
        padding: 4,
    },

    /* ── Content ── */
    image: {
        width: width,
        height: 250,
        backgroundColor: '#e0e0e0',
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 8,
        lineHeight: 32,
    },
    timestamp: {
        fontSize: 13,
        color: '#757575',
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginBottom: 20,
    },
    description: {
        fontSize: 16,
        lineHeight: 26,
        color: '#424242',
    },
});

export default BroadcastDetailsScreen;
