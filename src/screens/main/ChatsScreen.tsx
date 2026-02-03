import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { chatService } from '../../services/chatService';
import { courseService } from '../../services/courseService';
import { userService } from '../../services/userService';
import { profileService } from '../../services/profileService';
import { ChatList, Course, Profile } from '../../types';
import { EmptyState } from '../../components';
import { logger } from '../../utils/logger';
import { secureImageUrl } from '../../utils/secureUrl';
import { useAuth } from '../../contexts/AuthContext';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type TabType = 'all' | 'group' | 'personal';

export const ChatsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Group chat modal
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [groupName, setGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Personal chat modal
  const [showCreateChatModal, setShowCreateChatModal] = useState(false);
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const fetchChats = async () => {
    try {
      const data = await chatService.getChats({ ordering: '-created_at' });
      setChats(data);
    } catch (error) {
      logger.error('Error fetching chats:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await courseService.getMyCourses();
      setCourses(data);
    } catch (error) {
      logger.error('Error fetching courses:', error);
    }
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      logger.info('[ChatsScreen] Fetching available users for chat...');

      // Use specialized endpoint as per backend requirement
      const profiles = await chatService.getAvailableUsers();

      // Debug: log raw response
      logger.info('[ChatsScreen] Raw profiles response type:', typeof profiles);
      logger.info('[ChatsScreen] Is array:', Array.isArray(profiles));
      logger.info('[ChatsScreen] Available users count:', profiles?.length || 0);

      if (profiles && profiles.length > 0) {
        logger.info('[ChatsScreen] First profile sample:', JSON.stringify(profiles[0]));
      }

      // Check if profiles is actually an array
      if (!Array.isArray(profiles)) {
        logger.error('[ChatsScreen] Profiles is not an array, got:', typeof profiles);
        setUsers([]);
        Alert.alert('Error', 'Invalid response from server');
        return;
      }

      // Log current user for filtering debug
      logger.info('[ChatsScreen] Current user id for filtering:', user?.id);

      // Filter out current user's profile just in case backend includes it
      const filteredProfiles = profiles.filter((p) => {
        const profileUserId = p.user || p.id;
        const shouldInclude = profileUserId !== user?.id;
        logger.debug(`[ChatsScreen] Profile ${p.id}: userId=${profileUserId}, include=${shouldInclude}`);
        return shouldInclude;
      });

      logger.info('[ChatsScreen] Filtered profiles count:', filteredProfiles.length);

      // Map to Profile with email from user if needed
      const userProfiles: (Profile & { email?: string })[] = filteredProfiles.map((p: any) => {
        const displayName = p.first_name || p.name || p.username || 'User';
        return {
          id: p.id,
          user: p.user || p.id, // Support both Profile (user) and User (id) structures
          first_name: displayName,
          last_name: p.last_name || '',
          avatar: p.avatar || null,
          email: p.email || '',
        } as Profile & { email?: string };
      });

      logger.info('[ChatsScreen] Final user profiles count:', userProfiles.length);
      setUsers(userProfiles);

      if (userProfiles.length === 0) {
        Alert.alert('Info', 'No users found to chat with.');
      }
    } catch (error: any) {
      logger.error('[ChatsScreen] Error fetching users:', error);
      if (error.response) {
        logger.error('[ChatsScreen] Error response:', JSON.stringify(error.response.data));
        logger.error('[ChatsScreen] Error status:', error.response.status);
      }
      Alert.alert('Error', `Failed to load users: ${error.message}`);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchChats();
  };

  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [])
  );

  // Filter chats based on tab and search
  const filteredChats = chats.filter((chat) => {
    // Tab filter
    if (activeTab === 'group' && chat.type !== 'group') return false;
    if (activeTab === 'personal' && chat.type !== 'dm') return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return chat.display_title?.toLowerCase().includes(query);
    }
    return true;
  });

  const handleOpenCreateChat = async () => {
    // Open modal immediately, then fetch users
    setShowCreateChatModal(true);
    await fetchUsers();
  };

  const handleCreatePersonalChat = async (selectedUser: Profile) => {
    setIsCreating(true);
    logger.info('[ChatsScreen] Creating personal chat with user:', JSON.stringify(selectedUser));

    try {
      const payload = {
        type: 'dm' as const,
        user_id: selectedUser.user,
      };
      logger.info('[ChatsScreen] createChat payload:', JSON.stringify(payload));

      // Create new DM chat with selected user
      const newChat = await chatService.createChat(payload);
      logger.info('[ChatsScreen] Chat created successfully:', JSON.stringify(newChat));

      setShowCreateChatModal(false);
      navigation.navigate('ChatDetail', { chatId: newChat.id });
    } catch (error: any) {
      logger.error('[ChatsScreen] Failed to create personal chat:', error);
      if (error.response) {
        logger.error('[ChatsScreen] Error response data:', JSON.stringify(error.response.data));
        logger.error('[ChatsScreen] Error response status:', error.response.status);
      }

      const errorData = error.response?.data;
      const errorDetail =
        errorData?.detail ||
        errorData?.message ||
        (typeof errorData === 'object' ? JSON.stringify(errorData) : null) ||
        'Failed to create chat';

      Alert.alert('Error', errorDetail);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenCreateGroup = async () => {
    await fetchCourses();
    setShowCreateGroupModal(true);
  };

  const handleCreateGroupChat = async () => {
    if (!selectedCourseId) {
      Alert.alert('Error', 'Please select a course');
      return;
    }
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    setIsCreating(true);
    try {
      const newChat = await chatService.createChat({
        type: 'group',
        title: groupName.trim(),
        course: selectedCourseId,
      });
      setShowCreateGroupModal(false);
      setGroupName('');
      setSelectedCourseId('');
      navigation.navigate('ChatDetail', { chatId: newChat.id });
    } catch (error: any) {
      logger.error('Failed to create group chat:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to create group chat');
    } finally {
      setIsCreating(false);
    }
  };

  const renderChatItem = ({ item, index }: { item: ChatList; index: number }) => {
    // Check for valid avatar URL (not null, undefined, or empty string)
    const hasAvatar = item.display_avatar && item.display_avatar.trim() !== '';
    // iOS blocks http:// - use secureImageUrl utility
    const avatarUrl = secureImageUrl(item.display_avatar);

    return (
      <TouchableOpacity
        testID={`chat-item-${index}`}
        style={styles.chatItem}
        onPress={() => navigation.navigate('ChatDetail', { chatId: item.id })}
      >
        {hasAvatar ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} resizeMode="cover" />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons
              name={item.type === 'group' ? 'people' : 'person'}
              size={28}
              color={colors.text.tertiary}
            />
          </View>
        )}
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle} numberOfLines={1}>
              {item.display_title || 'Chat'}
            </Text>
            {item.last_message?.created_at && (
              <Text style={styles.timeText}>
                {new Date(item.last_message.created_at).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                })}
              </Text>
            )}
          </View>
          <View style={styles.chatFooter}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.last_message?.text || 'No messages yet'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      {(['all', 'group', 'personal'] as TabType[]).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => setActiveTab(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSearch = () => (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color={colors.text.tertiary} />
      <TextInput
        style={styles.searchInput}
        placeholder="search..."
        placeholderTextColor={colors.text.tertiary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
    </View>
  );

  // Only teachers can create chats
  const isTeacher = user?.role === 'teacher';

  const renderCreateButtons = () => {
    // All users can create personal chats
    // Teachers can create both personal and group chats
    const showPersonal = activeTab !== 'group';
    const showGroup = isTeacher && activeTab !== 'personal';

    if (!showPersonal && !showGroup) return null;

    return (
      <View style={styles.createButtonsContainer}>
        {showPersonal && (
          <TouchableOpacity
            testID="create-chat-button"
            style={styles.createButton}
            onPress={handleOpenCreateChat}
          >
            <Ionicons name="add" size={20} color={colors.text.primary} />
            <Text style={styles.createButtonText}>New Chat</Text>
          </TouchableOpacity>
        )}

        {/* Check IS TEACHER for group chat creation */}
        {showGroup && (
          <TouchableOpacity
            testID="create-group-chat-button"
            style={styles.createGroupButton}
            onPress={handleOpenCreateGroup}
          >
            <Ionicons name="people" size={20} color={colors.text.inverse} />
            <Text style={styles.createGroupButtonText}>New Group</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Personal Chat Modal - List of users
  const renderCreateChatModal = () => (
    <Modal
      visible={showCreateChatModal}
      transparent
      animationType="fade"
      testID="create-chat-modal"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent} testID="create-chat-modal-content">
          <Text style={styles.modalTitle}>Create chat</Text>

          {isLoadingUsers ? (
            <View style={styles.loadingUsers}>
              <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
          ) : users.length === 0 ? (
            <Text style={styles.noUsersText}>No users available</Text>
          ) : (
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              style={styles.usersList}
              contentContainerStyle={{ paddingBottom: spacing.md }}
              renderItem={({ item: userProfile, index }) => (
                <TouchableOpacity
                  testID={`user-item-${index}`}
                  style={styles.userItem}
                  onPress={() => handleCreatePersonalChat(userProfile)}
                  disabled={isCreating}
                >
                  {userProfile.avatar ? (
                    <Image
                      source={{ uri: secureImageUrl(userProfile.avatar) }}
                      style={styles.userAvatar}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.userAvatarPlaceholder}>
                      <Ionicons name="person" size={20} color={colors.text.tertiary} />
                    </View>
                  )}
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {(userProfile.first_name || '').trim()} {(userProfile.last_name || '').trim()}
                    </Text>
                    <Text style={styles.userEmail} numberOfLines={1}>
                      {(userProfile as any).email || 'No email'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}

          <TouchableOpacity
            testID="cancel-chat-modal"
            style={styles.modalCloseButton}
            onPress={() => setShowCreateChatModal(false)}
          >
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Group Chat Modal
  const renderCreateGroupModal = () => (
    <Modal visible={showCreateGroupModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create group chat</Text>

          <Text style={styles.modalLabel}>
            Choose course <Text style={styles.required}>*</Text>
          </Text>
          {courses.length === 0 ? (
            <Text style={styles.noCoursesText}>No courses available. Create a course first.</Text>
          ) : (
            <ScrollView style={styles.courseList} horizontal={false} showsVerticalScrollIndicator>
              {courses.map((course) => (
                <TouchableOpacity
                  key={course.id}
                  style={[
                    styles.courseItem,
                    selectedCourseId === course.id && styles.courseItemSelected,
                  ]}
                  testID={`course-item-${course.id}`}
                  onPress={() => setSelectedCourseId(course.id)}
                >
                  <Text
                    style={[
                      styles.courseItemText,
                      selectedCourseId === course.id && styles.courseItemTextSelected,
                    ]}
                  >
                    {course.title}
                  </Text>
                  {selectedCourseId === course.id && (
                    <Ionicons name="checkmark" size={20} color={colors.primary.main} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <Text style={styles.modalLabel}>
            Name of the chat <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Enter chat name"
            placeholderTextColor={colors.text.tertiary}
            value={groupName}
            testID="group-chat-name-input"
            onChangeText={setGroupName}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowCreateGroupModal(false);
                setGroupName('');
                setSelectedCourseId('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.nextButton,
                (isCreating || !selectedCourseId || !groupName.trim()) && styles.disabledButton,
              ]}
              testID="create-group-submit-button"
              onPress={handleCreateGroupChat}
              disabled={isCreating || !selectedCourseId || !groupName.trim()}
            >
              {isCreating ? (
                <ActivityIndicator size="small" color={colors.text.inverse} />
              ) : (
                <Text style={styles.nextButtonText}>Next</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} testID="chats-screen">
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      {renderTabs()}
      {renderSearch()}
      {renderCreateButtons()}

      {isLoading && chats.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      ) : (
        <FlatList
          testID="chats-list"
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary.main}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No Messages"
              message={
                activeTab === 'all'
                  ? "You haven't started any chats yet."
                  : `No ${activeTab} chats found.`
              }
              icon="chatbubble-ellipses-outline"
            />
          }
        />
      )}

      {renderCreateChatModal()}
      {renderCreateGroupModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... (previous styles) ...
  container: { flex: 1, backgroundColor: colors.background.default },
  header: { padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border.light },
  title: { ...textStyles.h2, color: colors.text.primary },

  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  // ... tab styles ...
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
  },
  activeTab: { backgroundColor: colors.neutral[800] },
  tabText: { ...textStyles.body, color: colors.text.secondary },
  activeTabText: { color: colors.text.inverse },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  searchInput: { flex: 1, ...textStyles.body, color: colors.text.primary, padding: 0 },

  listContent: { paddingVertical: spacing.sm, paddingBottom: 100 },
  chatItem: {
    flexDirection: 'row',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    alignItems: 'center',
  },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.neutral[200] },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatInfo: { flex: 1, marginLeft: spacing.base, justifyContent: 'center' },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  chatTitle: { ...textStyles.body, fontWeight: '600', color: colors.text.primary, flex: 1 },
  timeText: { ...textStyles.caption, color: colors.text.tertiary },
  chatFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastMessage: {
    ...textStyles.caption,
    color: colors.text.secondary,
    flex: 1,
    marginRight: spacing.sm,
  },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  createButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  createButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm, // reduced padding
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.default,
  },
  createButtonText: { ...textStyles.body, color: colors.text.primary, fontWeight: '500' },
  createGroupButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm, // reduced padding
    backgroundColor: colors.neutral[800],
    borderRadius: borderRadius.md,
  },
  createGroupButtonText: { ...textStyles.body, color: colors.text.inverse, fontWeight: '500' },
  // ... rest of modal styles

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    ...textStyles.h3,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalLabel: { ...textStyles.body, color: colors.text.primary, marginBottom: spacing.sm },
  required: { color: colors.primary.main },

  // Users list for personal chat
  usersList: { maxHeight: 400, marginBottom: spacing.md },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  userAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.neutral[200] },
  userAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: { marginLeft: spacing.md, flex: 1 },
  userName: { ...textStyles.body, fontWeight: '600', color: colors.text.primary },
  userEmail: { ...textStyles.caption, color: colors.text.secondary },
  loadingUsers: { height: 150, justifyContent: 'center', alignItems: 'center' },
  noUsersText: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
  modalCloseButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    marginTop: spacing.md,
  },
  modalCloseText: { ...textStyles.body, color: colors.text.secondary },

  // Courses list for group chat
  courseList: { maxHeight: 150, marginBottom: spacing.md },
  courseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  courseItemSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main + '10',
  },
  courseItemText: { ...textStyles.body, color: colors.text.primary, flex: 1 },
  courseItemTextSelected: { color: colors.primary.main, fontWeight: '600' },
  noCoursesText: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginVertical: spacing.md,
  },

  modalInput: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...textStyles.body,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  modalButtons: { flexDirection: 'row', gap: spacing.md },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: { ...textStyles.body, color: colors.text.primary },
  nextButton: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  nextButtonText: { ...textStyles.body, color: colors.text.inverse, fontWeight: '600' },
  disabledButton: { opacity: 0.6 },
});
