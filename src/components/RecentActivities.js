import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import apiService from '../Redux/apiService';

const RecentActivities = () => {
  const { t } = useTranslation();
  const [approvedListings, setApprovedListings] = useState([]);

  useEffect(() => {
    fetchApprovedListings();
  }, []);

  const fetchApprovedListings = async () => {
    try {
      const response = await apiService.getUserCropListings();
      
      const approved = (response.data || [])
        .filter(item => item.status === 'Approved' || item.status === 'approved')
        .sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt))
        .slice(0, 3);
      
      setApprovedListings(approved);
    } catch (error) {
      console.error('Failed to fetch approved listings:', error);
    }
  };

  return (
    <View style={styles.container}>
      {approvedListings.length === 0 ? (
        <Text style={styles.emptyText}>No approved listings yet</Text>
      ) : (
        approvedListings.map((item, index) => (
          <TouchableOpacity key={`${item._id || item.id}-${index}`} style={styles.activityCard}>
            <Text style={styles.activityText}>{item.cropName || item.name} - Approved</Text>
            <Text style={styles.activityTime}>₹{item.price}/quintal • {item.quantity}quintal</Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  activityTime: {
    fontSize: 11,
    color: '#777',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    marginHorizontal: 16,
  },
});

export default RecentActivities;