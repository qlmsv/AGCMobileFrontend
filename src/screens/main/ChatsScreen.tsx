import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl, TextInput, Modal, Alert, ScrollView } from 'react-native';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { chatService } from '../../services/chatService';
import { courseService } from '../../services/courseService';
import { profileService } from '../../services/profileService';
import { userService } from '../../services/userService';
import { ChatList, Course, Profile, User } from '../../types';
import { EmptyState } from '../../components';
import { logger } from '../../utils/logger';
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
            logger.info('Getting existing DM contacts...');

            // Show existing DM chats as contacts - clicking will open the chat
            const dmChats = chats.filter(chat => chat.type === 'dm');
            logger.info('DM chats found:', dmChats.length);

            // Map DM chats to Profile-like structure for display
            // Use chat.id as the identifier - we'll open the chat directly
            const contacts: Profile[] = dmChats.map(chat => {
                const nameParts = (chat.display_title || 'User').split(' ');
                return {
                    id: chat.id, // Use chat.id so we can open it directly
                    user: chat.id, // This will be used as chatId when clicking
                    first_name: nameParts[0] || 'User',
                    last_name: nameParts.slice(1).join(' ') || '',
                    avatar: chat.display_avatar || null,
                } as Profile;
            });

            logger.info('Contacts from DM chats:', contacts.length);
            setUsers(contacts);

            if (contacts.length === 0) {
                Alert.alert('Info', 'No DM conversations yet. Backend needs to fix /profiles/ API to show all users.');
            }
        } catch (error: any) {
            logger.error('Error getting contacts:', error);
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
    const filteredChats = chats.filter(chat => {
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
        await fetchUsers();
        setShowCreateChatModal(true);
    };

    const handleCreatePersonalChat = async (selectedUser: Profile) => {
        // selectedUser.user now contains the chatId (from fetchUsers)
        // Just navigate to the existing chat
        setShowCreateChatModal(false);
        navigation.navigate('ChatDetail', { chatId: selectedUser.user });
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

    const renderChatItem = ({ item }: { item: ChatList }) => (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => navigation.navigate('ChatDetail', { chatId: item.id })}
        >
            {item.display_avatar ? (
                <Image source={{ uri: item.display_avatar }} style={styles.avatar} />
            ) : (
                <View style={styles.avatarPlaceholder}>
                    <Ionicons name={item.type === 'group' ? 'people' : 'person'} size={28} color={colors.text.tertiary} />
                </View>
            )}
            <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                    <Text style={styles.chatTitle} numberOfLines={1}>{item.display_title || 'Chat'}</Text>
                    {item.last_message?.created_at && (
                        <Text style={styles.timeText}>
                            {new Date(item.last_message.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
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

    const renderCreateButtons = () => (
        <View style={styles.createButtonsContainer}>
            {activeTab !== 'group' && (
                <TouchableOpacity style={styles.createButton} onPress={handleOpenCreateChat}>
                    <Ionicons name="add" size={20} color={colors.text.primary} />
                    <Text style={styles.createButtonText}>Create chat</Text>
                </TouchableOpacity>
            )}
            {activeTab !== 'personal' && (
                <TouchableOpacity style={styles.createGroupButton} onPress={handleOpenCreateGroup}>
                    <Ionicons name="add" size={20} color={colors.text.inverse} />
                    <Text style={styles.createGroupButtonText}>Create group chat</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    // Personal Chat Modal - List of users
    const renderCreateChatModal = () => (
        <Modal visible={showCreateChatModal} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Create chat</Text>

                    {isLoadingUsers ? (
                        <View style={styles.loadingUsers}>
                            <ActivityIndicator size="large" color={colors.primary.main} />
                        </View>
                    ) : users.length === 0 ? (
                        <Text style={styles.noUsersText}>No users available</Text>
                    ) : (
                        <ScrollView style={styles.usersList}>
                            {users.map(userProfile => (
                                <TouchableOpacity
                                    key={userProfile.id}
                                    style={styles.userItem}
                                    onPress={() => handleCreatePersonalChat(userProfile)}
                                    disabled={isCreating}
                                >
                                    {userProfile.avatar ? (
                                        <Image source={{ uri: userProfile.avatar }} style={styles.userAvatar} />
                                    ) : (
                                        <View style={styles.userAvatarPlaceholder}>
                                            <Ionicons name="person" size={20} color={colors.text.tertiary} />
                                        </View>
                                    )}
                                    <View style={styles.userInfo}>
                                        <Text style={styles.userName}>
                                            {userProfile.first_name || ''} {userProfile.last_name || ''}
                                        </Text>
                                        {/* Show email if available - need to get from user */}
                                        <Text style={styles.userEmail} numberOfLines={1}>
                                            {userProfile.first_name ? 'User' : 'No name'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    <TouchableOpacity
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

                    <Text style={styles.modalLabel}>Choose course <Text style={styles.required}>*</Text></Text>
                    {courses.length === 0 ? (
                        <Text style={styles.noCoursesText}>No courses available. Create a course first.</Text>
                    ) : (
                        <ScrollView style={styles.courseList} horizontal={false} showsVerticalScrollIndicator>
                            {courses.map(course => (
                                <TouchableOpacity
                                    key={course.id}
                                    style={[styles.courseItem, selectedCourseId === course.id && styles.courseItemSelected]}
                                    onPress={() => setSelectedCourseId(course.id)}
                                >
                                    <Text style={[styles.courseItemText, selectedCourseId === course.id && styles.courseItemTextSelected]}>
                                        {course.title}
                                    </Text>
                                    {selectedCourseId === course.id && (
                                        <Ionicons name="checkmark" size={20} color={colors.primary.main} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    <Text style={styles.modalLabel}>Name of the chat <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.modalInput}
                        placeholder="Enter chat name"
                        placeholderTextColor={colors.text.tertiary}
                        value={groupName}
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
                            style={[styles.nextButton, (isCreating || !selectedCourseId || !groupName.trim()) && styles.disabledButton]}
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
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Messages</Text>
            </View>

            {renderTabs()}
            {renderSearch()}

            {isLoading && chats.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                </View>
            ) : (
                <FlatList
                    data={filteredChats}
                    renderItem={renderChatItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />
                    }
                    ListEmptyComponent={
                        <EmptyState
                            title="No Messages"
                            message={activeTab === 'all' ? "You haven't started any chats yet." : `No ${activeTab} chats found.`}
                            icon="chatbubble-ellipses-outline"
                        />
                    }
                    ListFooterComponent={renderCreateButtons}
                />
            )}

            {renderCreateChatModal()}
            {renderCreateGroupModal()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.default },
    header: { padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    title: { ...textStyles.h2, color: colors.text.primary },

    tabsContainer: { flexDirection: 'row', paddingHorizontal: spacing.base, paddingVertical: spacing.sm, gap: spacing.sm },
    tab: { flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.round, backgroundColor: colors.neutral[100], alignItems: 'center' },
    activeTab: { backgroundColor: colors.neutral[800] },
    tabText: { ...textStyles.body, color: colors.text.secondary },
    activeTabText: { color: colors.text.inverse },

    searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.base, marginBottom: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.neutral[100], borderRadius: borderRadius.md, gap: spacing.sm },
    searchInput: { flex: 1, ...textStyles.body, color: colors.text.primary, padding: 0 },

    listContent: { paddingVertical: spacing.sm, paddingBottom: 100 },
    chatItem: { flexDirection: 'row', padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border.light, alignItems: 'center' },
    avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.neutral[200] },
    avatarPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.neutral[200], justifyContent: 'center', alignItems: 'center' },
    chatInfo: { flex: 1, marginLeft: spacing.base, justifyContent: 'center' },
    chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    chatTitle: { ...textStyles.body, fontWeight: '600', color: colors.text.primary, flex: 1 },
    timeText: { ...textStyles.caption, color: colors.text.tertiary },
    chatFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    lastMessage: { ...textStyles.caption, color: colors.text.secondary, flex: 1, marginRight: spacing.sm },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    createButtonsContainer: { padding: spacing.base, gap: spacing.sm },
    createButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.neutral[300], borderRadius: borderRadius.md },
    createButtonText: { ...textStyles.body, color: colors.text.primary },
    createGroupButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md, backgroundColor: colors.neutral[800], borderRadius: borderRadius.md },
    createGroupButtonText: { ...textStyles.body, color: colors.text.inverse },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
    modalContent: { backgroundColor: colors.background.default, borderRadius: borderRadius.lg, padding: spacing.lg, width: '100%', maxWidth: 400, maxHeight: '80%' },
    modalTitle: { ...textStyles.h3, color: colors.text.primary, textAlign: 'center', marginBottom: spacing.lg },
    modalLabel: { ...textStyles.body, color: colors.text.primary, marginBottom: spacing.sm },
    required: { color: colors.primary.main },

    // Users list for personal chat
    usersList: { maxHeight: 300, marginBottom: spacing.md },
    userItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    userAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.neutral[200] },
    userAvatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.neutral[200], justifyContent: 'center', alignItems: 'center' },
    userInfo: { marginLeft: spacing.md, flex: 1 },
    userName: { ...textStyles.body, fontWeight: '600', color: colors.text.primary },
    userEmail: { ...textStyles.caption, color: colors.text.secondary },
    loadingUsers: { height: 150, justifyContent: 'center', alignItems: 'center' },
    noUsersText: { ...textStyles.body, color: colors.text.secondary, textAlign: 'center', marginVertical: spacing.lg },
    modalCloseButton: { paddingVertical: spacing.md, alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border.light, marginTop: spacing.md },
    modalCloseText: { ...textStyles.body, color: colors.text.secondary },

    // Courses list for group chat
    courseList: { maxHeight: 150, marginBottom: spacing.md },
    courseItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, borderWidth: 1, borderColor: colors.border.light, borderRadius: borderRadius.md, marginBottom: spacing.sm },
    courseItemSelected: { borderColor: colors.primary.main, backgroundColor: colors.primary.main + '10' },
    courseItemText: { ...textStyles.body, color: colors.text.primary, flex: 1 },
    courseItemTextSelected: { color: colors.primary.main, fontWeight: '600' },
    noCoursesText: { ...textStyles.body, color: colors.text.secondary, textAlign: 'center', marginVertical: spacing.md },

    modalInput: { borderWidth: 1, borderColor: colors.neutral[300], borderRadius: borderRadius.md, padding: spacing.md, ...textStyles.body, color: colors.text.primary, marginBottom: spacing.lg },
    modalButtons: { flexDirection: 'row', gap: spacing.md },
    cancelButton: { flex: 1, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.neutral[300], borderRadius: borderRadius.md, alignItems: 'center' },
    cancelButtonText: { ...textStyles.body, color: colors.text.primary },
    nextButton: { flex: 1, paddingVertical: spacing.md, backgroundColor: colors.primary.main, borderRadius: borderRadius.md, alignItems: 'center' },
    nextButtonText: { ...textStyles.body, color: colors.text.inverse, fontWeight: '600' },
    disabledButton: { opacity: 0.6 },
});
