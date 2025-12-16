import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { profileService } from '../../services/profileService';
import { colors, spacing, borderRadius, textStyles, layout, typography } from '../../theme';
import { validateFileSize, validateFileType } from '../../utils/validation';
import { RootStackParamList, MainTabParamList } from '../../navigation/types';

type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Profile'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const ProfileScreen: React.FC = () => {
  const { user, profile, logout, refreshUser } = useAuth();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleChangeAvatar = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please grant access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && profile) {
      const asset = result.assets[0];

      // Validate file size (max 5MB)
      if (asset.fileSize) {
        const sizeValidation = validateFileSize(asset.fileSize, 5);
        if (!sizeValidation.isValid) {
          Alert.alert('File Too Large', sizeValidation.error || 'File size exceeds limit');
          return;
        }
      }

      // Validate file type
      const mimeType = asset.mimeType || asset.type || 'image/jpeg';
      const typeValidation = validateFileType(mimeType);
      if (!typeValidation.isValid) {
        Alert.alert('Invalid File Type', typeValidation.error || 'Only images are allowed');
        return;
      }

      setIsLoading(true);
      try {
        interface FileUpload {
          uri: string;
          type: string;
          name: string;
        }

        const formData: FileUpload = {
          uri: asset.uri,
          type: mimeType,
          name: asset.fileName || 'avatar.jpg',
        };

        await profileService.uploadAvatar(profile.id, formData);
        await refreshUser();
        Alert.alert('Success', 'Avatar updated successfully');
      } catch (error) {
        Alert.alert('Error', 'Failed to update avatar');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleMenuItem = (item: string) => {
    Alert.alert('Coming Soon', `${item} feature will be available soon.`);
  };

  const quickActions = [
    {
      icon: 'book-outline',
      label: 'My courses',
      onPress: () => {
        navigation.navigate('Courses');
      }
    },
    {
      icon: 'star-outline',
      label: 'Favourites',
      onPress: () => handleMenuItem('Favourites')
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      onPress: () => handleMenuItem('Notifications')
    },
    {
      icon: 'wallet-outline',
      label: 'Payments',
      onPress: () => handleMenuItem('Payments')
    },
  ];

  const menuItems = [
    { icon: 'person-outline', title: 'Edit profile' },
    { icon: 'lock-closed-outline', title: 'Privacy' },
    { icon: 'settings-outline', title: 'Settings' },
    { icon: 'help-circle-outline', title: 'Help & support' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient
        colors={[colors.primary.light, colors.accent.peachSoft]}
        style={styles.heroBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.heroCard}>
        <TouchableOpacity onPress={handleChangeAvatar} disabled={isLoading} style={styles.avatarWrapper}>
          {profile?.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={spacing.huge} color={colors.neutral.white} />
            </View>
          )}
          <View style={styles.avatarBadge}>
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.neutral.white} />
            ) : (
              <Ionicons name="camera" size={typography.sizes.md} color={colors.neutral.white} />
            )}
          </View>
        </TouchableOpacity>

        <Text style={styles.name}>
          {profile?.first_name && profile?.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : 'User'}
        </Text>
        <Text style={styles.roleTextSecondary}>{user?.phone || user?.email}</Text>

        <View style={styles.rolePill}>
          <Text style={styles.rolePillText}>
            {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}
          </Text>
        </View>

        {(profile?.city || profile?.country) && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={colors.text.secondary} />
            <Text style={styles.locationText}>
              {[profile.city, profile.country].filter(Boolean).join(', ')}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.quickGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity key={action.label} style={styles.quickCard} onPress={action.onPress}>
            <View style={styles.quickIcon}>
              <Ionicons name={action.icon as any} size={20} color={colors.text.secondary} />
            </View>
            <Text style={styles.quickLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Account</Text>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={styles.menuItem}
            onPress={() => handleMenuItem(item.title)}
          >
            <View style={styles.menuLeft}>
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon as any} size={18} color={colors.text.primary} />
              </View>
              <Text style={styles.menuText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutCard} onPress={handleLogout}>
        <View style={styles.logoutIcon}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
        </View>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    padding: spacing.base,
    paddingBottom: spacing.huge,
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    borderBottomLeftRadius: borderRadius.huge,
    borderBottomRightRadius: borderRadius.huge,
  },
  heroCard: {
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    marginBottom: spacing.xl,
  },
  avatarWrapper: {
    marginBottom: spacing.sm,
  },
  avatar: {
    width: layout.avatar.large,
    height: layout.avatar.large,
    borderRadius: borderRadius.round,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    backgroundColor: colors.accent.charcoal,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background.default,
  },
  name: {
    ...textStyles.h1,
    marginTop: spacing.sm,
  },
  roleTextSecondary: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  rolePill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    backgroundColor: colors.accent.peachSoft,
  },
  rolePillText: {
    ...textStyles.caption,
    color: colors.primary.main,
    letterSpacing: 0.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  locationText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.base,
    marginBottom: spacing.xl,
  },
  quickCard: {
    width: '47%',
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLabel: {
    ...textStyles.bodySemiBold,
    color: colors.text.primary,
  },
  menuSection: {
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...textStyles.bodySemiBold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    ...textStyles.body,
  },
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  logoutIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.round,
    backgroundColor: colors.feedback.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    ...textStyles.bodySemiBold,
    color: colors.error,
  },
  version: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
