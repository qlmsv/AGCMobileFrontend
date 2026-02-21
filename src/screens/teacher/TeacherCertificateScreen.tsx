import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { courseService } from '../../services/courseService';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../config/api';
import { CourseStudent } from '../../types';
import { logger } from '../../utils/logger';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface UploadState {
  studentId: string;
  verificationUrl: string;
  fileUri: string | null;
  fileName: string | null;
  isUploading: boolean;
}

export const TeacherCertificateScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const courseId: string = route.params?.courseId;

  const [students, setStudents] = useState<CourseStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    studentId: '',
    verificationUrl: '',
    fileUri: null,
    fileName: null,
    isUploading: false,
  });

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiService.get<CourseStudent[]>(API_ENDPOINTS.COURSE_STUDENTS(courseId));
      const list = Array.isArray(data) ? data : (data as any)?.results ?? [];
      setStudents(list);
    } catch (error) {
      logger.error('Failed to fetch course students', error);
      Alert.alert('Error', 'Failed to load students.');
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const openUploadModal = (student: CourseStudent) => {
    setUploadState({
      studentId: student.id,
      verificationUrl: '',
      fileUri: null,
      fileName: null,
      isUploading: false,
    });
    setModalVisible(true);
  };

  const pickCertificateFile = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const fileName = asset.uri.split('/').pop() || 'certificate.jpg';
      setUploadState((prev) => ({ ...prev, fileUri: asset.uri, fileName }));
    }
  };

  const handleUpload = async () => {
    if (!uploadState.fileUri) {
      Alert.alert('Error', 'Please select a certificate file.');
      return;
    }

    setUploadState((prev) => ({ ...prev, isUploading: true }));
    try {
      const formData = new FormData();
      const fileName = uploadState.fileName || 'certificate.jpg';
      const match = /\.(\w+)$/.exec(fileName);
      const fileType = match ? `image/${match[1]}` : 'image/jpeg';
      formData.append('pdf_file', { uri: uploadState.fileUri, name: fileName, type: fileType } as any);
      formData.append('student_id', uploadState.studentId);
      if (uploadState.verificationUrl.trim()) {
        formData.append('verification_url', uploadState.verificationUrl.trim());
      }

      await courseService.uploadCertificate(courseId, formData);
      setModalVisible(false);
      Alert.alert('Success', 'Certificate uploaded successfully!');
    } catch (error: any) {
      logger.error('Certificate upload failed', error);
      const detail = error?.response?.data?.detail || error?.message || 'Upload failed';
      Alert.alert('Error', detail);
    } finally {
      setUploadState((prev) => ({ ...prev, isUploading: false }));
    }
  };

  const getStudentName = (student: CourseStudent): string => {
    if (student.profile?.first_name || student.profile?.last_name) {
      return `${student.profile.first_name ?? ''} ${student.profile.last_name ?? ''}`.trim();
    }
    return student.email || 'Unknown Student';
  };

  const renderStudentItem = ({ item }: { item: CourseStudent }) => (
    <View style={styles.studentCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.profile?.first_name?.[0]?.toUpperCase() || item.email?.[0]?.toUpperCase() || 'S'}
        </Text>
      </View>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{getStudentName(item)}</Text>
        <Text style={styles.studentEmail}>{item.email}</Text>
      </View>
      <TouchableOpacity style={styles.uploadBtn} onPress={() => openUploadModal(item)}>
        <Ionicons name="ribbon-outline" size={18} color={colors.text.inverse} />
        <Text style={styles.uploadBtnText}>Issue</Text>
      </TouchableOpacity>
    </View>
  );

  const selectedStudent = students.find((s) => s.id === uploadState.studentId);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Issue Certificates</Text>
        <View style={styles.backButton} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      ) : students.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="people-outline" size={48} color={colors.text.tertiary} />
          <Text style={styles.emptyText}>No enrolled students yet</Text>
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          renderItem={renderStudentItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* Upload Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Issue Certificate</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>

              {selectedStudent && (
                <View style={styles.selectedStudentRow}>
                  <Ionicons name="person-circle-outline" size={20} color={colors.primary.main} />
                  <Text style={styles.selectedStudentName}>{getStudentName(selectedStudent)}</Text>
                </View>
              )}

              <Text style={styles.fieldLabel}>Certificate File *</Text>
              <TouchableOpacity style={styles.filePicker} onPress={pickCertificateFile}>
                {uploadState.fileUri ? (
                  <View style={styles.fileSelected}>
                    <Ionicons name="document-outline" size={20} color={colors.primary.main} />
                    <Text style={styles.fileSelectedText} numberOfLines={1}>
                      {uploadState.fileName}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.filePlaceholder}>
                    <Ionicons name="cloud-upload-outline" size={32} color={colors.text.tertiary} />
                    <Text style={styles.filePlaceholderText}>Tap to select certificate image</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text style={styles.fieldLabel}>Verification URL (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://verify.example.com/cert/..."
                placeholderTextColor={colors.text.tertiary}
                value={uploadState.verificationUrl}
                onChangeText={(val) =>
                  setUploadState((prev) => ({ ...prev, verificationUrl: val }))
                }
                autoCapitalize="none"
                keyboardType="url"
              />

              <TouchableOpacity
                style={[styles.submitBtn, uploadState.isUploading && styles.submitBtnDisabled]}
                onPress={handleUpload}
                disabled={uploadState.isUploading}
              >
                {uploadState.isUploading ? (
                  <ActivityIndicator color={colors.text.inverse} />
                ) : (
                  <Text style={styles.submitBtnText}>Upload Certificate</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyText: {
    ...textStyles.body,
    color: colors.text.tertiary,
  },
  list: {
    padding: spacing.md,
  },
  separator: {
    height: spacing.sm,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...textStyles.bodyLarge,
    color: colors.primary.main,
    fontWeight: '700',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  studentEmail: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  uploadBtnText: {
    ...textStyles.caption,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.default,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
  selectedStudentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary.light + '30',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  selectedStudentName: {
    ...textStyles.body,
    color: colors.primary.main,
    fontWeight: '600',
  },
  fieldLabel: {
    ...textStyles.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  filePicker: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  filePlaceholder: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  filePlaceholderText: {
    ...textStyles.body,
    color: colors.text.tertiary,
  },
  fileSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  fileSelectedText: {
    ...textStyles.body,
    color: colors.text.primary,
    flex: 1,
  },
  input: {
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...textStyles.body,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  submitBtn: {
    backgroundColor: colors.primary.main,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    ...textStyles.body,
    color: colors.text.inverse,
    fontWeight: '600',
  },
});
