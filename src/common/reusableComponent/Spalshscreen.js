import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, Animated, ActivityIndicator } from "react-native";
import Images from "../../assets/Images/Images";
import { FARMER_COLORS } from '../../colorsList/ColorList';

const Splashscreen = () => {
  const [loading, setLoading] = useState(true);
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const textFadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      // First: Image animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]),
      // Then: Text animation
      Animated.parallel([
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* ANIMATED IMAGE */}
      <Animated.View
        style={[
          styles.imageContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={Images.firstScreen}
          style={styles.splashImage}
          resizeMode="cover"
        />
      </Animated.View>

      {/* ANIMATED TEXT CONTENT */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: textFadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.title}>Beej Se Bazar</Text>
      </Animated.View>

      {/* ANIMATED LOADING */}
      {loading && (
        <Animated.View style={{ opacity: textFadeAnim, marginTop: 40 }}>
          <ActivityIndicator size="large" color={FARMER_COLORS.primary} />
        </Animated.View>
      )}
    </View>
  );
};

export default Splashscreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  imageContainer: {
    width: 250,
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 40,
    elevation: 8,
    shadowColor: FARMER_COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    marginBottom: 20,
  },

  splashImage: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
    
  },

  content: {
    alignItems: "center",
    marginTop: 20,
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    color: FARMER_COLORS.primary,
    textAlign: "center",
    letterSpacing: 1,
  },
});

