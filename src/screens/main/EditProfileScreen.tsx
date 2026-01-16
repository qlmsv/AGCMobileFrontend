import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, textStyles, borderRadius, layout } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../../utils/logger';
import apiService from '../../services/api';
import * as ImagePicker from 'expo-image-picker';
import { profileService } from '../../services/profileService';

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, profile, updateProfile, logout } = useAuth();

  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [phone, setPhone] = useState(profile?.phone_number || '');
  const [avatarUri, setAvatarUri] = useState<string | null>(profile?.avatar || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please grant camera roll permissions to change your avatar.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('avatar', {
        uri,
        name: filename,
        type,
      } as any);

      await profileService.updateMyProfileWithAvatar(formData);
      setAvatarUri(uri);
      Alert.alert('Success', 'Avatar updated successfully!');
    } catch (error) {
      logger.error('Failed to upload avatar:', error);
      Alert.alert('Error', 'Failed to upload avatar. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
      });
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (error) {
      logger.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await apiService.delete('/users/my-user/');
              Alert.alert('Account Deleted', 'Your account has been deleted.');
              logout();
            } catch (error: any) {
              logger.error('Failed to delete account:', error);
              Alert.alert('Error', error.response?.data?.detail || 'Failed to delete account.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color={colors.primary.main} />
          ) : (
            <Text style={styles.saveButton}>Edit</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Avatar - clickable to change */}
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={pickImage}
          disabled={isUploadingAvatar}
        >
          <View style={styles.avatar}>
            {isUploadingAvatar ? (
              <ActivityIndicator color={colors.primary.main} />
            ) : avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} resizeMode="cover" />
            ) : (
              <Ionicons name="person-outline" size={40} color={colors.text.tertiary} />
            )}
          </View>
          <View style={styles.editBadge}>
            <Ionicons name="camera" size={14} color={colors.text.inverse} />
          </View>
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter first name"
            placeholderTextColor={colors.text.tertiary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter last name"
            placeholderTextColor={colors.text.tertiary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={user?.email}
            editable={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+1234567890"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator color={colors.primary.main} />
          ) : (
            <Text style={styles.deleteButtonText}>Delete account</Text>
          )}
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
  saveButton: {
    ...textStyles.button,
    color: colors.primary.main,
  },
  content: {
    padding: spacing.base,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[300],
    overflow: 'hidden',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: colors.primary.main,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background.default,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  input: {
    height: layout.input.height,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    ...textStyles.body,
    color: colors.text.primary,
    backgroundColor: colors.background.default,
  },
  disabledInput: {
    backgroundColor: colors.neutral[100],
    color: colors.text.tertiary,
  },
  deleteButton: {
    marginTop: spacing.xl,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  deleteButtonText: {
    ...textStyles.body,
    color: colors.primary.main,
  },
});
