import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import LoadingBotAnimation from './LoadingBot.json';

const FloatingAIAssistant = ({ onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.animationWrapper}>
        <LottieView
          source={LoadingBotAnimation}
          autoPlay
          loop
          style={styles.animation}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationWrapper: {
    width: 54,
    height: 54,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});

export default FloatingAIAssistant;
