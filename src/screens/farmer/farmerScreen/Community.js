import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, StatusBar } from "react-native";
import AllPosts from "./AllPosts";
import MyPosts from "./MyPosts";
import { useTranslation } from "react-i18next";
import { FARMER_COLORS } from '../../../colorsList/ColorList';

const TabButton = ({ tab, activeTab, setActiveTab, title }) => (
  <TouchableOpacity
    style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
    onPress={() => setActiveTab(tab)}
    activeOpacity={0.7}
  >
    <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
      {title}
    </Text>
  </TouchableOpacity>
);

export default function Community() {
  const [activeTab, setActiveTab] = useState("all");
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <View style={styles.headerSpacer} />
      <View style={styles.tabContainer}>
        <View style={styles.tabRow}>
          <TabButton
            tab="all"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            title={t('community_screen.all_posts')}
          />
          <TabButton
            tab="my"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            title={t('community_screen.my_posts')}
          />
        </View>
      </View>
      
      {activeTab === "all" ? <AllPosts /> : <MyPosts />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  headerSpacer: {
    height: 6,
    backgroundColor: "#ffffff",
  },
  tabContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    zIndex: 10,
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#F4F6F8",
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  activeTabButton: {
    backgroundColor: "#ffffff",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeTabText: { 
    color: FARMER_COLORS.primaryLight, 
    fontWeight: "800",
  },
});
