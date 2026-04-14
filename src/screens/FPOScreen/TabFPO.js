import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";

import { FPO_COLORS } from '../../colorsList/ColorList';
import {
  UserStackHome,
  UserStackVisit,
  UserStackPerformance,
  UserStackProfile,
} from "./FPOStack";

const Tab = createBottomTabNavigator();
const THEME = FPO_COLORS.primary; // Steel Blue — FPO brand

const TAB_CONFIG = [
  { name: "HomeTab",      icon: "home",    iconOutline: "home-outline",    labelKey: "fpo_tabs.home"      },
  { name: "FarmerTab",    icon: "people",  iconOutline: "people-outline",  labelKey: "fpo_tabs.farmers"   },
  { name: "InventoryTab", icon: "cube",    iconOutline: "cube-outline",    labelKey: "fpo_tabs.inventory" },
  { name: "ProfileTab",   icon: "person",  iconOutline: "person-outline",  labelKey: "fpo_tabs.profile"   },
];

/* ── Custom Tab Bar ─────────────────────────────────────────────── */
const CustomTabBar = ({ state, navigation }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.tabBarWrapper}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const config = TAB_CONFIG.find(c => c.name === route.name) || TAB_CONFIG[0];

          const onPress = () => {
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.8}
              style={styles.tabItem}
            >
              {isFocused ? (
                <View style={styles.activeTab}>
                  <View style={styles.activeIconBox}>
                    <Icon name={config.icon} size={20} color="#fff" />
                  </View>
                  <Text style={styles.activeLabel} numberOfLines={1}>
                    {t(config.labelKey)}
                  </Text>
                </View>
              ) : (
                <View style={styles.inactiveTab}>
                  <Icon name={config.iconOutline} size={22} color="#9CA3AF" />
                  <Text style={styles.inactiveLabel} numberOfLines={1}>
                    {t(config.labelKey)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

/* ── Navigator ──────────────────────────────────────────────────── */
const TabStackuser = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="HomeTab"      component={UserStackHome}        />
      <Tab.Screen name="FarmerTab"    component={UserStackVisit}       />
      <Tab.Screen name="InventoryTab" component={UserStackPerformance} />
      <Tab.Screen name="ProfileTab"   component={UserStackProfile}     />
    </Tab.Navigator>
  );
};

export default TabStackuser;

/* ── Styles ─────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
  },
  tabBarWrapper: {
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 10,
    paddingTop: 6,
    backgroundColor: "transparent",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ACTIVE */
  activeTab: { alignItems: "center", justifyContent: "center", gap: 4 },
  activeIconBox: {
    width: 44, height: 32, borderRadius: 16,
    backgroundColor: THEME,
    alignItems: "center", justifyContent: "center",
    elevation: 4,
    shadowColor: THEME,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  activeLabel: {
    fontSize: 10, fontWeight: "700", color: THEME, letterSpacing: 0.2,
  },

  /* INACTIVE */
  inactiveTab: { alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 4 },
  inactiveLabel: { fontSize: 10, fontWeight: "500", color: "#9CA3AF" },
});
