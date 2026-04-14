import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import apiService from '../Redux/apiService';

const LatestNotifications = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await apiService.getAllBroadcasts(1, 4);
      if (response?.success) {
        setNotifications((response.data || []).slice(0, 4));
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <View style={styles.container}>
      {notifications.length === 0 ? (
        <Text style={styles.emptyText}>{t('no_notifications', 'No notifications yet')}</Text>
      ) : (
        notifications.map((item, index) => (
          <TouchableOpacity 
            key={`${item._id}-${index}`} 
            style={styles.activityCard}
            onPress={() => navigation.navigate('BroadcastDetails', { broadcastId: item._id })}
          >
            <Text style={styles.activityText} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.activityTime}>{formatDate(item.sentAt || item.createdAt)}</Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
  },
  activityCard: {
    backgroundColor: '#F0FBF4',
    marginHorizontal: 16,
    marginTop: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CDEED9',
  },
  activityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 11,
    color: '#777',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    marginHorizontal: 16,
  },
});

export default LatestNotifications;
