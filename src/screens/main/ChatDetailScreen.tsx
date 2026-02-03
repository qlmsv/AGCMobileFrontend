import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { chatService } from '../../services/chatService';
import { userService } from '../../services/userService';
import { Message, Chat, ChatMember } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../../utils/logger';
import { secureImageUrl } from '../../utils/secureUrl';

export const ChatDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const chatId = route.params?.chatId;
  const { user } = useAuth();

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Members modal
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  const fetchChatData = useCallback(async () => {
    try {
      const [chatData, messagesData] = await Promise.all([
        chatService.getChat(chatId),
        chatService.getMessages(chatId),
      ]);
      setChat(chatData);
      setMessages(messagesData); // Keep original order - with inverted FlatList, first item shows at bottom
    } catch (error) {
      logger.error('Error fetching chat details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    fetchChatData();
  }, [fetchChatData]);

  const fetchMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const membersData = await chatService.getChatMembers(chatId);

      // Load all users once, then match by ID
      const allUsers = await userService.searchUsers();
      const usersMap = new Map(allUsers.map((u: any) => [u.id, u]));

      const membersWithProfiles = membersData.map((member: any) => {
        const userData = usersMap.get(member.user);
        return {
          ...member,
          role: member.role_in_chat || member.role || 'member',
          user_profile: userData
            ? {
                first_name: userData.first_name || userData.name?.split(' ')[0] || null,
                last_name: userData.last_name || null,
                avatar: userData.avatar || null,
              }
            : null,
        };
      });

      setMembers(membersWithProfiles);
    } catch (error) {
      logger.error('Error fetching members:', error);
      Alert.alert('Error', 'Failed to load members');
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleShowMembers = async () => {
    await fetchMembers();
    setShowMembersModal(true);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    const tempId = Date.now();
    try {
      const tempMessage: Message = {
        id: tempId,
        chat: chatId,
        sender: user?.id || '',
        content: message,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_read: false,
      };

      // Optimistic update
      setMessages((prev) => [tempMessage, ...prev]);
      setMessage('');

      logger.info('Sending message to chat:', chatId, 'content:', tempMessage.content);
      const newMessage = await chatService.sendMessage(chatId, tempMessage.content);
      logger.info('Message sent successfully:', newMessage);
      // Replace temp message with real one
      setMessages((prev) => prev.map((m) => (m.id === tempId ? newMessage : m)));
    } catch (error: any) {
      logger.error('Error sending message:', error);
      logger.error('Error response:', JSON.stringify(error.response?.data));
      logger.error('Error status:', error.response?.status);
      // Rollback optimistic update on error
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      Alert.alert('Ошибка', error.response?.data?.detail || 'Не удалось отправить сообщение');
    } finally {
      setIsSending(false);
    }
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender === user?.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer,
        ]}
      >
        {!isMyMessage && (
          <Text style={styles.senderName}>{item.sender_profile?.first_name || 'User'}</Text>
        )}
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.theirMessageText,
            ]}
          >
            {item.content}
          </Text>
        </View>
        <Text style={styles.timestamp}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} testID="chat-detail-screen">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text testID="chat-header" style={styles.headerTitle}>
            {chat?.display_title || `Chat ${chatId}`}
          </Text>
          {chat?.type === 'group' && (
            <Text style={styles.headerSubtitle}>{(chat as any)?.members_count || ''} members</Text>
          )}
        </View>
        {chat?.type === 'group' && (
          <TouchableOpacity style={styles.backButton} onPress={handleShowMembers}>
            <Ionicons name="people" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      ) : (
        <FlatList
          testID="messages-list"
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item, index) => item.id?.toString() || `msg-${index}`}
          inverted // Show newest at bottom
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet. Start the conversation!</Text>
            </View>
          }
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            testID="message-input"
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.text.tertiary}
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            testID="send-message-button"
            style={[styles.sendButton, (!message.trim() || isSending) && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!message.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={colors.text.inverse} />
            ) : (
              <Ionicons name="send" size={20} color={colors.text.inverse} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Members Modal */}
      <Modal
        visible={showMembersModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMembersModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Group Members</Text>
              <TouchableOpacity onPress={() => setShowMembersModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            {isLoadingMembers ? (
              <ActivityIndicator
                size="large"
                color={colors.primary.main}
                style={{ marginTop: 40 }}
              />
            ) : (
              <ScrollView style={styles.membersList}>
                {members.map((member) => (
                  <View key={member.id} style={styles.memberItem}>
                    <View style={styles.memberAvatar}>
                      {member.user_profile?.avatar ? (
                        <Image
                          source={{ uri: secureImageUrl(member.user_profile.avatar) }}
                          style={styles.avatarImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <Ionicons name="person" size={24} color={colors.text.tertiary} />
                      )}
                    </View>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>
                        {member.user_profile?.first_name || 'User'}{' '}
                        {member.user_profile?.last_name || ''}
                      </Text>
                      <Text style={styles.memberRole}>{member.role}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
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
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  headerTitle: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
  headerSubtitle: {
    ...textStyles.caption,
    color: colors.success,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    ...textStyles.body,
    color: colors.text.tertiary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing.sm,
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.round,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: colors.neutral[100],
    borderRadius: 20,
    paddingHorizontal: spacing.base,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text.primary,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.round,
  },
  sendButtonDisabled: {
    backgroundColor: colors.neutral[300],
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    marginVertical: 4,
    paddingHorizontal: spacing.base,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  theirMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    padding: spacing.sm,
    borderRadius: 16,
  },
  myMessageBubble: {
    backgroundColor: colors.primary.main,
    borderBottomRightRadius: 2,
  },
  theirMessageBubble: {
    backgroundColor: colors.neutral[100],
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  myMessageText: {
    color: colors.text.inverse,
  },
  theirMessageText: {
    color: colors.text.primary,
  },
  senderName: {
    fontSize: 10,
    color: colors.text.tertiary,
    marginBottom: 2,
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 10,
    color: colors.text.tertiary,
    marginTop: 2,
    alignSelf: 'flex-end',
    marginRight: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.default,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
  membersList: {
    padding: spacing.base,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.base,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  memberRole: {
    ...textStyles.caption,
    color: colors.text.secondary,
    textTransform: 'capitalize',
  },
});
