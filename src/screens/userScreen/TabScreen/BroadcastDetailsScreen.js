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
    SafeAreaView,
    StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { STAFF_COLORS } from '../../../colorsList/ColorList';
import apiService from '../../../Redux/apiService';

const { width } = Dimensions.get('window');

const BroadcastDetailsScreen = ({ route, navigation }) => {
    const { broadcastId, title, description, image, timestamp } =
        route.params || {};

    const [broadcast, setBroadcast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (title && description) {
            setBroadcast({ title, description, image, sentAt: timestamp });
            setLoading(false);
        }
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
            <SafeAreaView style={styles.safeArea}>
                <StatusBar
                    barStyle="light-content"
                    backgroundColor={STAFF_COLORS.primary}
                    translucent={false}
                />

                <LinearGradient
                    colors={[STAFF_COLORS.primary, STAFF_COLORS.primaryDark, STAFF_COLORS.primaryLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.8}
                        >
                            <Icon name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>

                        <View style={styles.headerCenter}>
                            <Text style={styles.headerTitle}>Broadcast</Text>
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={STAFF_COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (error || !broadcast) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar
                    barStyle="light-content"
                    backgroundColor={STAFF_COLORS.primary}
                    translucent={false}
                />

                <LinearGradient
                    colors={[STAFF_COLORS.primary, STAFF_COLORS.primaryDark, STAFF_COLORS.primaryLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.8}
                        >
                            <Icon name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>

                        <View style={styles.headerCenter}>
                            <Text style={styles.headerTitle}>Broadcast</Text>
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error || "Broadcast not found"}</Text>
                    <TouchableOpacity
                        style={styles.backButtonInline}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
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
                return img;
            }
        }
        if (typeof img === 'object') return img.url || null;
        return null;
    };

    const imageUrl = getImageUrl(broadcast.image);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={STAFF_COLORS.primary}
                translucent={false}
            />

            <LinearGradient
                colors={[STAFF_COLORS.primary, STAFF_COLORS.primaryDark, STAFF_COLORS.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.8}
                    >
                        <Icon name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Broadcast</Text>
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.container}>
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
        </SafeAreaView>
    );
};

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

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerGradient: {
        paddingBottom: 12,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 12,
    },
    backBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
