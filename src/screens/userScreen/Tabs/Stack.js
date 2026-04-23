import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { STAFF_COLORS } from '../../../colorsList/ColorList';
import {
  UserStackHome,
  UserStackVisit,
  UserStackPerformance,
  UserStackInventory,
  UserStackProfile,
} from './UserStacks';

const Tab = createBottomTabNavigator();
const ACTIVE_COLOR = STAFF_COLORS.primary;
const INACTIVE_COLOR = '#9CA3AF';
const TAB_BAR_BOTTOM_INSET_MAX = 10;
const TAB_BAR_BOTTOM_INSET_OVERRIDE = null;

const TAB_CONFIG = [
  { name: 'Home',      icon: 'home',    labelKey: 'tabs.home'      },
  { name: 'Farmers',   icon: 'people',  labelKey: 'tabs.farmers'   },
  { name: 'Buy',       icon: 'receipt', labelKey: 'tabs.buy'       },
  { name: 'Inventory', icon: 'cube',    labelKey: 'tabs.inventory' },
  { name: 'Profile',   icon: 'person',  labelKey: 'tabs.profile'   },
];

/* ── Animated Tab Item ──────────────────────────────────────────── */
const TabItem = ({ config, isFocused, onPress }) => {
  const { t } = useTranslation();
  const anim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: isFocused ? 1 : 0,
      useNativeDriver: false,
      friction: 7,
      tension: 60,
    }).start();
  }, [isFocused]);

  const indicatorWidth = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '80%'],
  });

  const labelColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [INACTIVE_COLOR, ACTIVE_COLOR],
  });

  const iconScale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12],
  });

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.tabItem}>
      <View style={styles.indicatorTrack}>
        <Animated.View style={[styles.indicator, { width: indicatorWidth }]} />
      </View>
      <Animated.View style={{ transform: [{ scale: iconScale }], marginTop: 6 }}>
        <Icon
          name={isFocused ? config.icon : `${config.icon}-outline`}
          size={24}
          color={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR}
        />
      </Animated.View>
      <Animated.Text style={[styles.tabLabel, { color: labelColor }]}>
        {t(config.labelKey)}
      </Animated.Text>
    </TouchableOpacity>
  );
};

/* ── Custom Tab Bar ──────────────────────────────────────────────── */
const CustomTabBar = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();
  const bottomInset =
    TAB_BAR_BOTTOM_INSET_OVERRIDE ??
    Math.min(insets.bottom, TAB_BAR_BOTTOM_INSET_MAX);

  return (
    <View
      style={[
        styles.tabBar,
        { height: 65 + bottomInset, paddingBottom: bottomInset },
      ]}
    >
      {TAB_CONFIG.map((config, index) => {
        const isFocused = state.index === index;
        return (
          <TabItem
            key={config.name}
            config={config}
            isFocused={isFocused}
            onPress={() => {
              if (!isFocused) {
                navigation.navigate(config.name);
              }
            }}
          />
        );
      })}
    </View>
  );
};

/* ── Navigator ───────────────────────────────────────────────────── */
const TabStackuser = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home"      component={UserStackHome}        />
      <Tab.Screen name="Farmers"   component={UserStackVisit}       />
      <Tab.Screen name="Buy"       component={UserStackPerformance} />
      <Tab.Screen name="Inventory" component={UserStackInventory}   />
      <Tab.Screen name="Profile"   component={UserStackProfile}     />
    </Tab.Navigator>
  );
};

export default TabStackuser;

/* ── Styles ──────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  indicatorTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    height: 3,
    backgroundColor: ACTIVE_COLOR,
    borderRadius: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});
