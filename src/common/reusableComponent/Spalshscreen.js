// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   Animated,
//   ActivityIndicator,
// } from 'react-native';
// import Images from '../../assets/Images/Images';
// import { FARMER_COLORS } from '../../colorsList/ColorList';

// const Splashscreen = () => {
//   const [loading, setLoading] = useState(true);

//   const fadeAnim = React.useRef(new Animated.Value(0)).current;
//   const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
//   const textFadeAnim = React.useRef(new Animated.Value(0)).current;
//   const slideAnim = React.useRef(new Animated.Value(30)).current;

//   useEffect(() => {
//     Animated.sequence([
//       // First: Image animation
//       Animated.parallel([
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 800,
//           useNativeDriver: true,
//         }),
//         Animated.spring(scaleAnim, {
//           toValue: 1,
//           friction: 4,
//           useNativeDriver: true,
//         }),
//       ]),
//       // Then: Text animation
//       Animated.parallel([
//         Animated.timing(textFadeAnim, {
//           toValue: 1,
//           duration: 600,
//           useNativeDriver: true,
//         }),
//         Animated.timing(slideAnim, {
//           toValue: 0,
//           duration: 600,
//           useNativeDriver: true,
//         }),
//       ]),
//     ]).start();

//     const timer = setTimeout(() => {
//       setLoading(false);
//     }, 2500);

//     return () => clearTimeout(timer);
//   }, []);

//   return (
//     <View style={styles.container}>
//       {/* ANIMATED IMAGE */}
//       <Animated.View
//         style={[
//           styles.imageContainer,
//           {
//             opacity: fadeAnim,
//             transform: [{ scale: scaleAnim }],
//           },
//         ]}
//       >
//         <Image
//           source={Images.firstScreen}
//           style={styles.splashImage}
//           resizeMode="cover"
//         />
//       </Animated.View>

//       {/* ANIMATED TEXT CONTENT */}
//       <Animated.View
//         style={[
//           styles.content,
//           {
//             opacity: textFadeAnim,
//             transform: [{ translateY: slideAnim }],
//           },
//         ]}
//       >
//         <Text style={styles.title}>Retailer Management System</Text>
//       </Animated.View>

//       {/* ANIMATED LOADING */}
//       {loading && (
//         <Animated.View style={{ opacity: textFadeAnim, marginTop: 40 }}>
//           <ActivityIndicator size="large" color={FARMER_COLORS.primary} />
//         </Animated.View>
//       )}
//     </View>
//   );
// };

// export default Splashscreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 20,
//   },

//   imageContainer: {
//     width: 250,
//     height: 250,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 40,
//     elevation: 8,
//     shadowColor: FARMER_COLORS.primary,
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.15,
//     shadowRadius: 20,
//     marginBottom: 20,
//   },

//   splashImage: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 40,
//   },

//   content: {
//     alignItems: 'center',
//     marginTop: 20,
//   },

//   title: {
//     fontSize: 34,
//     fontWeight: '800',
//     color: FARMER_COLORS.primary,
//     textAlign: 'center',
//     letterSpacing: 1,
//   },
// });
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import Images from '../../assets/Images/Images';
import { FARMER_COLORS } from '../../colorsList/ColorList';

const { width, height } = Dimensions.get('window');

// ─────────────────────────────────────────
//  Ripple Ring
// ─────────────────────────────────────────
const RippleRing = ({ delay, size }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 2400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 2400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.55,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: 'rgba(144, 202, 249, 0.55)',
        opacity,
        transform: [{ scale }],
      }}
    />
  );
};

// ─────────────────────────────────────────
//  Floating Orb
// ─────────────────────────────────────────
const FloatingOrb = ({ x, y, size, delay, color }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(opacity, {
        toValue: 0.18,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -14,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateY }],
      }}
    />
  );
};

// ─────────────────────────────────────────
//  Shimmer Bar
// ─────────────────────────────────────────
const ShimmerBar = ({ barWidth, top, delay }) => {
  const translateX = useRef(new Animated.Value(-barWidth)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(translateX, {
          toValue: barWidth * 2.5,
          duration: 1900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -barWidth,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.delay(1400),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: barWidth,
        height: 2,
        top,
        left: 0,
        backgroundColor: 'rgba(187, 222, 251, 0.35)',
        borderRadius: 2,
        transform: [{ translateX }],
      }}
    />
  );
};

// ─────────────────────────────────────────
//  Loading Dot
// ─────────────────────────────────────────
const LoadingDot = ({ delay }) => {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(translateY, {
          toValue: -9,
          duration: 360,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 360,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(700),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        width: 9,
        height: 9,
        borderRadius: 5,
        backgroundColor: '#90CAF9',
        marginHorizontal: 5,
        transform: [{ translateY }],
      }}
    />
  );
};

// ─────────────────────────────────────────
//  Main Splashscreen
// ─────────────────────────────────────────
const Splashscreen = () => {
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const bgPulse = useRef(new Animated.Value(1)).current;
  const glowPulse = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Background slow breathe
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgPulse, {
          toValue: 1.07,
          duration: 4200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bgPulse, {
          toValue: 1,
          duration: 4200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Glow halo pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 0.9,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0.3,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Main entrance sequence (same as original)
    Animated.sequence([
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

    const timer = setTimeout(() => setLoading(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* ── Deep Blue Background Layers ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.bgBase} />
        <Animated.View
          style={[styles.bgCircleLarge, { transform: [{ scale: bgPulse }] }]}
        />
        <Animated.View
          style={[styles.bgCircleMedium, { transform: [{ scale: bgPulse }] }]}
        />
        <View style={styles.bgCircleSmall} />
      </View>

      {/* ── Floating Orbs ── */}
      <FloatingOrb x={-40} y={60} size={200} delay={200} color="#90CAF9" />
      <FloatingOrb
        x={width - 110}
        y={100}
        size={150}
        delay={500}
        color="#42A5F5"
      />
      <FloatingOrb
        x={width * 0.15}
        y={height * 0.68}
        size={130}
        delay={350}
        color="#64B5F6"
      />
      <FloatingOrb
        x={width * 0.58}
        y={height * 0.74}
        size={95}
        delay={700}
        color="#BBDEFB"
      />

      {/* ── Shimmer Streaks ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <ShimmerBar barWidth={190} top={height * 0.22} delay={0} />
        <ShimmerBar barWidth={130} top={height * 0.38} delay={700} />
        <ShimmerBar barWidth={210} top={height * 0.58} delay={350} />
        <ShimmerBar barWidth={100} top={height * 0.71} delay={1050} />
      </View>

      {/* ── Ripple Rings behind logo ── */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
          top: 0,
          left: 0,
          right: 0,
          bottom: 80,
        }}
      >
        <RippleRing delay={0} size={330} />
        <RippleRing delay={800} size={330} />
        <RippleRing delay={1600} size={330} />
      </View>

      {/* ── ANIMATED IMAGE ── */}
      <Animated.View
        style={[
          styles.imageContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Glow halo behind image */}
        <Animated.View
          pointerEvents="none"
          style={[styles.glowHalo, { opacity: glowPulse }]}
        />

        <Image
          source={Images.firstScreen}
          style={styles.splashImage}
          resizeMode="cover"
        />
      </Animated.View>

      {/* ── ANIMATED TEXT CONTENT ── */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: textFadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.subtitle}>Welcome to</Text>
        <Text style={styles.title}>Retailer Management System</Text>
        <View style={styles.titleUnderline} />
      </Animated.View>

      {/* ── ANIMATED LOADING ── */}
      {loading && (
        <Animated.View style={[styles.loadingRow, { opacity: textFadeAnim }]}>
          <LoadingDot delay={0} />
          <LoadingDot delay={180} />
          <LoadingDot delay={360} />
        </Animated.View>
      )}
    </View>
  );
};

export default Splashscreen;

// ─────────────────────────────────────────
//  Styles
// ─────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  // Background
  bgBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0D2B6B',
  },
  bgCircleLarge: {
    position: 'absolute',
    width: width * 1.7,
    height: width * 1.7,
    borderRadius: width * 0.85,
    backgroundColor: '#1A3A8A',
    top: -width * 0.55,
    left: -width * 0.35,
    opacity: 0.6,
  },
  bgCircleMedium: {
    position: 'absolute',
    width: width * 1.3,
    height: width * 1.3,
    borderRadius: width * 0.65,
    backgroundColor: '#0A1F6E',
    bottom: -width * 0.35,
    right: -width * 0.25,
    opacity: 0.65,
  },
  bgCircleSmall: {
    position: 'absolute',
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: width * 0.38,
    backgroundColor: '#1565C0',
    bottom: height * 0.14,
    left: -width * 0.12,
    opacity: 0.14,
  },

  // Image
  imageContainer: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  glowHalo: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#42A5F5',
  },
  splashImage: {
    width: 250,
    height: 250,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: 'rgba(187, 222, 251, 0.4)',
    shadowColor: FARMER_COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },

  // Text
  content: {
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 24,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(187, 222, 251, 0.75)',
    letterSpacing: 3.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 40,
  },
  titleUnderline: {
    marginTop: 14,
    width: 50,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#42A5F5',
  },

  // Loading
  loadingRow: {
    flexDirection: 'row',
    marginTop: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
