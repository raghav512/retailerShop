import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import AllPosts from "./StaffAllPosts";
import MyPosts from "./StaffPosts";
import { STAFF_COLORS } from '../../../colorsList/ColorList';

const TabButton = ({ tab, activeTab, setActiveTab, title }) => (
  <TouchableOpacity
    style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
    onPress={() => setActiveTab(tab)}
  >
    <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
      {title}
    </Text>
  </TouchableOpacity>
);

export default function StaffCommunity() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("all");

  return (
    <View style={styles.container}>
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
      
      {activeTab === "all" ? <AllPosts /> : <MyPosts />}
    </View>
  );
}

const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  tabButton: {
    flex: 1,
    padding: 12,
    alignItems: "center",
  },
  tabText: {
    fontSize: 15,
    color: "#555",
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: STAFF_COLORS.primary,
  },
  activeTabText: { 
    color: STAFF_COLORS.primary, 
    fontWeight: "bold" 
  },
});
