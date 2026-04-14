import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, StatusBar } from "react-native";
import AllPosts from "./FpoAllPosts";
import MyPosts from "./FpoPosts";
import { useTranslation } from "react-i18next";
import { FPO_COLORS } from '../../../colorsList/ColorList';

const THEME = FPO_COLORS.primary; // FPO Steel Blue

const FpoCommunity = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("all");

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <View style={styles.headerSpacer} />

      {/* FLOATING PILL TOGGLE */}
      <View style={styles.toggleContainer}>
        <View style={styles.toggleWrapper}>
          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === "all" && styles.activeToggleBtn]}
            onPress={() => setActiveTab("all")}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, activeTab === "all" && styles.activeToggleText]}>
              {t('community_screen.all_posts')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === "my" && styles.activeToggleBtn]}
            onPress={() => setActiveTab("my")}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, activeTab === "my" && styles.activeToggleText]}>
              {t('community_screen.my_posts')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* CONTENT */}
      <View style={styles.content}>
        {activeTab === "all" ? <AllPosts /> : <MyPosts />}
      </View>
    </View>
  );
}

export default FpoCommunity;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  headerSpacer: { height: 6, backgroundColor: "#F4F6F8" },
  
  toggleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#F4F6F8",
    zIndex: 10,
  },
  toggleWrapper: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 30,
    padding: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 26,
  },
  activeToggleBtn: {
    backgroundColor: THEME,
    elevation: 2,
    shadowColor: THEME,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeToggleText: { 
    color: "#ffffff", 
    fontWeight: "700" 
  },
  
  content: {
    flex: 1,
  }
});
