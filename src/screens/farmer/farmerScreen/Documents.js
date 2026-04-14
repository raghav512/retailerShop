import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { pick, types } from "@react-native-documents/picker";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { FARMER_COLORS } from '../../../colorsList/ColorList';

/* 🔹 DOCUMENT DATA (Replace with API later) */
const DOCUMENTS = [
  {
    id: "1",
    titleKey: "soil_health_card",
    descKey: "soil_health_desc",
    status: "uploaded",
    date: "Uploaded on 10 Dec 2025",
  },
  {
    id: "2",
    titleKey: "lab_reports",
    descKey: "lab_reports_desc",
    status: "pending",
    date: "Pending upload",
  },
  {
    id: "3",
    titleKey: "gov_documents",
    descKey: "gov_documents_desc",
    status: "uploaded",
    date: "Uploaded on 5 Dec 2025",
  },
];

const Documents = () => {
    const [fileData, setFileData] = useState(null);
    const navigation = useNavigation()
       const { t } = useTranslation(); // 🌍

     // 🔹 Document Picker Function
    const pickDocument = async (setter) => {
      try {
        const result = await pick({
          type: [types.pdf, types.allFiles],
          allowMultiSelection: false,
        });
    
        const file = result[0];
    
        const fileData = {
          uri: file.uri || file.fileCopyUri,
          name: file.name || file.fileName,
          type: file.type || file.mime,
          size: file.size,
        };
    
        if (setter) {
          setter(fileData);
        }
    
        setFileData(fileData);
    
        console.log("FILE => ", fileData);
    
      } catch (err) {
        if (err.code === "DOCUMENT_PICKER_CANCELED") {
          console.log("User cancelled document picker");
        } else {
          console.log("Document picker error:", err);
        }
      }
    };
    


  const renderDocument = ({ item }) => {
    const isUploaded = item.status === "uploaded";

    return (
      <View style={styles.card}>
        {/* ICON */}
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: isUploaded ? "#D97706" : "#E0E0E0" },
          ]}
        >
          <Text style={styles.icon}>
            {isUploaded ? "✔" : "📄"}
          </Text>
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          <Text style={styles.title}>{t(item.titleKey)}</Text>
          <Text style={styles.desc}>{t(item.descKey)}</Text>

          <View style={styles.statusRow}>
            <Text
              style={[
                styles.statusDot,
                { color: isUploaded ? "#D97706" : "#FF9800" },
              ]}
            >
              ●
            </Text>
            <Text
              style={[
                styles.statusText,
                { color: isUploaded ? "#D97706" : "#FF9800" },
              ]}
            >
              {item.date}
            </Text>
          </View>

          {/* ACTIONS */}
          {isUploaded ? (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.viewBtn}>
                <Text style={styles.viewText}>{t("view")}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.reuploadBtn}>
                <Text style={styles.reuploadText}>{t("reupload")}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadBtn}
             onPress={() => {
               const setter = (file) => {
                 // Handle file data if needed
                 console.log("File selected:", file);
               };
               pickDocument(setter);
             }}
            >
              <Text style={styles.uploadText}>{t("upload_document")}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>{t("documents")}</Text>
          <Text style={styles.headerSub}>
            {t("manage_documents")}
          </Text>
        </View>
      </View>

      {/* DOCUMENT LIST */}
      <FlatList
        data={DOCUMENTS}
        renderItem={renderDocument}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        scrollEnabled={false}
      />

      {/* INFO CARD */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>{t("why_upload")}</Text>
        <Text style={styles.infoText}>
          {t("why_upload_desc")}
        </Text>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

export default Documents;
const styles = StyleSheet.create({
  headerSpacer: {
    height: 6,
  },
  container: {
    flex: 1,
    backgroundColor: FARMER_COLORS.background,
  },

  /* HEADER */
  header: {
    backgroundColor: "#D97706",
    padding: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 22,
    color: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  headerSub: {
    fontSize: 12,
    color: "#e2f0c9",
    marginTop: 2,
  },

  /* CARD */
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  icon: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
  },
  desc: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  statusDot: {
    fontSize: 10,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },

  /* ACTIONS */
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  viewBtn: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewText: {
    color: "#D97706",
    fontSize: 12,
    fontWeight: "600",
  },
  reuploadBtn: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  reuploadText: {
    color: "#3F51B5",
    fontSize: 12,
    fontWeight: "600",
  },
  uploadBtn: {
    backgroundColor: "#D97706",
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  uploadText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  /* INFO CARD */
  infoCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: "#555",
    lineHeight: 18,
  },
});

