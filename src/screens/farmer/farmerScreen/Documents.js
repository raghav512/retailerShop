import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { pick, types } from '@react-native-documents/picker';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { FARMER_COLORS } from '../../../colorsList/ColorList';
import { apiService } from '../../../Redux/apiService';

/* 🔹 DOCUMENT DATA (Replace with API later) */
const DOCUMENTS = [
  {
    id: '1',
    titleKey: 'soil_health_card',
    descKey: 'soil_health_desc',
    status: 'uploaded',
    date: 'Uploaded on 10 Dec 2025',
  },
  {
    id: '2',
    titleKey: 'lab_reports',
    descKey: 'lab_reports_desc',
    status: 'pending',
    date: 'Pending upload',
  },
  {
    id: '3',
    titleKey: 'gov_documents',
    descKey: 'gov_documents_desc',
    status: 'uploaded',
    date: 'Uploaded on 5 Dec 2025',
  },
];

const Documents = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [otherDocuments, setOtherDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);

  // 🔹 Pick Single Document
  const pickSingleDocument = async () => {
    try {
      const result = await pick({
        type: [types.pdf, types.allFiles],
        allowMultiSelection: false,
      });

      const file = result[0];
      const selectedFile = {
        uri: file.uri || file.fileCopyUri,
        name: file.name || file.fileName,
        type: file.type || file.mime,
        size: file.size,
      };

      setOtherDocuments(prev => [...prev, selectedFile]);
      console.log('FILE => ', selectedFile);
    } catch (err) {
      const isPickerCancelled =
        err?.code === 'OPERATION_CANCELED' ||
        err?.code === 'DOCUMENT_PICKER_CANCELED';

      if (!isPickerCancelled) {
        console.log('Document picker error:', err);
      }
    }
  };

  // 🔹 Remove Document
  const removeDocument = index => {
    setOtherDocuments(prev => prev.filter((_, i) => i !== index));
  };

  // 🔹 Upload Documents to Backend
  const uploadOtherDocuments = async () => {
    if (otherDocuments.length === 0) {
      Alert.alert(
        'No Documents',
        'Please add at least one document to upload.',
      );
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();

      otherDocuments.forEach((doc, index) => {
        // Create proper file object for FormData
        // In React Native, FormData expects the file object to have uri, type, and name properties
        const fileObject = {
          uri: doc.uri,
          type: doc.type || 'application/pdf',
          name: doc.name || `document_${index}.pdf`,
        };
        
        // Append each file with the same key 'otherDocuments' to create an array
        // The backend will receive this as an array of files
        formData.append('otherDocuments', fileObject);
      });

      console.log('FormData keys:', Array.from(formData.keys()));

      console.log('Uploading otherDocuments with payload:', otherDocuments);

      const response = await apiService.uploadDocuments(formData);

      console.log('Upload response:', response);
      Alert.alert('Success', 'Documents uploaded successfully!');
      setOtherDocuments([]);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload documents. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const renderDocument = ({ item }) => {
    const isUploaded = item.status === 'uploaded';

    return (
      <View style={styles.card}>
        {/* ICON */}
        <View
          style={[
            styles.iconWrapper,
            isUploaded ? styles.iconWrapperUploaded : styles.iconWrapperPending,
          ]}
        >
          <Text style={styles.icon}>{isUploaded ? '✔' : '📄'}</Text>
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          <Text style={styles.title}>{t(item.titleKey)}</Text>
          <Text style={styles.desc}>{t(item.descKey)}</Text>

          <View style={styles.statusRow}>
            <Text
              style={[
                styles.statusDot,
                isUploaded ? styles.statusUploaded : styles.statusPending,
              ]}
            >
              ●
            </Text>
            <Text
              style={[
                styles.statusText,
                isUploaded ? styles.statusUploaded : styles.statusPending,
              ]}
            >
              {item.date}
            </Text>
          </View>

          {/* ACTIONS */}
          {isUploaded ? (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.viewBtn}>
                <Text style={styles.viewText}>{t('view')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.reuploadBtn}>
                <Text style={styles.reuploadText}>{t('reupload')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={() => {
                const setter = file => {
                  console.log('File selected:', file);
                };
                pickSingleDocument(setter);
              }}
            >
              <Text style={styles.uploadText}>{t('upload_document')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // 🔹 Render Other Documents Card
  const renderOtherDocumentsCard = () => (
    <View style={styles.card}>
      <View style={styles.iconWrapper}>
        <Text style={styles.icon}>📁</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{t('other_documents')}</Text>
        <Text style={styles.desc}>{t('other_documents_desc')}</Text>

        {/* Selected Documents List */}
        {otherDocuments.length > 0 && (
          <View style={styles.selectedDocsContainer}>
            {otherDocuments.map((doc, index) => (
              <View key={index} style={styles.selectedDocItem}>
                <Text style={styles.selectedDocName} numberOfLines={1}>
                  📄 {doc.name}
                </Text>
                <TouchableOpacity
                  onPress={() => removeDocument(index)}
                  style={styles.removeBtn}
                >
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Add Document Button */}
        <TouchableOpacity style={styles.addDocBtn} onPress={pickSingleDocument}>
          <Text style={styles.addDocBtnText}>+ {t('add_document')}</Text>
        </TouchableOpacity>

        {/* Upload Button */}
        {otherDocuments.length > 0 && (
          <TouchableOpacity
            style={[styles.uploadBtn, uploading && styles.uploadBtnDisabled]}
            onPress={uploadOtherDocuments}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.uploadText}>{t('upload_all')}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>{t('documents')}</Text>
          <Text style={styles.headerSub}>{t('manage_documents')}</Text>
        </View>
      </View>

      {/* DOCUMENT LIST */}
      <FlatList
        data={DOCUMENTS}
        renderItem={renderDocument}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
      />

      {/* OTHER DOCUMENTS SECTION */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('other_documents')}</Text>
      </View>
      {renderOtherDocumentsCard()}

      {/* INFO CARD */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>{t('why_upload')}</Text>
        <Text style={styles.infoText}>{t('why_upload_desc')}</Text>
      </View>

      <View style={styles.bottomSpacer} />
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
    backgroundColor: '#D97706',
    padding: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerSub: {
    fontSize: 12,
    color: '#e2f0c9',
    marginTop: 2,
  },

  /* CARD */
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconWrapperUploaded: {
    backgroundColor: '#D97706',
  },
  iconWrapperPending: {
    backgroundColor: '#E0E0E0',
  },
  icon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
  },
  desc: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  statusDot: {
    fontSize: 10,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusUploaded: {
    color: '#D97706',
  },
  statusPending: {
    color: '#FF9800',
  },

  /* ACTIONS */
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  viewBtn: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewText: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: '600',
  },
  reuploadBtn: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  reuploadText: {
    color: '#3F51B5',
    fontSize: 12,
    fontWeight: '600',
  },
  uploadBtn: {
    backgroundColor: '#D97706',
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  uploadText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  /* INFO CARD */
  listContent: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#555',
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 30,
  },

  /* OTHER DOCUMENTS SECTION */
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  selectedDocsContainer: {
    marginTop: 10,
    gap: 6,
  },
  selectedDocItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  selectedDocName: {
    fontSize: 12,
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  removeBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF5252',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  addDocBtn: {
    backgroundColor: '#E8F5E9',
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D97706',
    borderStyle: 'dashed',
  },
  addDocBtnText: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: '600',
  },
  uploadBtnDisabled: {
    opacity: 0.6,
  },
});
