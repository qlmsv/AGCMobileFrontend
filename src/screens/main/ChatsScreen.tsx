import React, { useEffect, useMemo, useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Chat } from '../../types';
import { chatService } from '../../services/chatService';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { logApiError } from '../../utils/errorUtils';

export const ChatsScreen: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [segment, setSegment] = useState<'all' | 'group' | 'personal'>('all');

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      console.log('📥 Loading chats...');
      const chatsData = await chatService.getChats();
      console.log('✅ Chats loaded:', chatsData.length);
      setChats(chatsData);
    } catch (error) {
      console.error('❌ Failed to load chats:', error);
      logApiError('Failed to load chats', error);
      setChats([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      const matchesSegment =
        segment === 'all' || (segment === 'group' && chat.type === 'group') || (segment === 'personal' && chat.type === 'dm');

      const searchLower = query.trim().toLowerCase();
      const matchesQuery =
        !searchLower ||
        chat.name?.toLowerCase().includes(searchLower) ||
        chat.last_message?.content?.toLowerCase().includes(searchLower);

      return matchesSegment && matchesQuery;
    });
  }, [chats, segment, query]);

  const renderChat = ({ item }: { item: Chat }) => {
    const unreadCount = item.unread_count ?? 0;
    const hasUnreadMessages = unreadCount > 0;

    return (
      <TouchableOpacity
        style={styles.chatCard}
        activeOpacity={0.8}
        onPress={() => console.log('Open chat:', item.id)}
      >
        <View style={styles.avatarContainer}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons
                name={item.type === 'group' ? 'people' : 'person'}
                size={24}
                color={colors.neutral.white}
              />
            </View>
          )}
          {hasUnreadMessages && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName} numberOfLines={1}>
              {item.name || 'Chat'}
            </Text>
            {item.last_message && (
              <Text style={styles.chatTime}>{formatTime(item.last_message.created_at)}</Text>
            )}
          </View>

          <View style={styles.chatFooter}>
            <Text
              style={[styles.lastMessage, hasUnreadMessages ? styles.lastMessageUnread : undefined]}
              numberOfLines={1}
            >
              {item.last_message?.content || 'No messages yet'}
            </Text>
            {item.type === 'group' && (
              <Ionicons name="people-outline" size={14} color={colors.text.tertiary} style={styles.groupIcon} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.info} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredChats}
        renderItem={renderChat}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.neutral[300]} />
            <Text style={styles.emptyText}>No chats yet</Text>
            <Text style={styles.emptySubtext}>Start a conversation to see it here</Text>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <View style={styles.navRow}>
              <View style={styles.circleButton} />
              <View>
                <Text style={styles.title}>Chats</Text>
                <Text style={styles.subtitle}>Stay connected with your classes</Text>
              </View>
              <TouchableOpacity style={styles.circleButton} onPress={() => console.log('Add person')}>
                <Ionicons name="person-add-outline" size={20} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color={colors.text.tertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                placeholderTextColor={colors.text.tertiary}
                value={query}
                onChangeText={setQuery}
              />
            </View>

            <View style={styles.segmentRow}>
              {(['all', 'group', 'personal'] as const).map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[styles.segmentPill, segment === value && styles.segmentPillActive]}
                  onPress={() => setSegment(value)}
                >
                  <Text style={[styles.segmentLabel, segment === value && styles.segmentLabelActive]}>
                    {value === 'all' ? 'All' : value === 'group' ? 'Group' : 'Personal'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => console.log('Create new chat')}>
        <Ionicons name="create-outline" size={24} color={colors.neutral.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    padding: spacing.base,
    gap: spacing.base,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background.default,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    ...textStyles.h2,
    textAlign: 'center',
  },
  subtitle: {
    ...textStyles.caption,
    textAlign: 'center',
    color: colors.text.tertiary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...textStyles.body,
    color: colors.text.primary,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segmentPill: {
    flex: 1,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background.default,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  segmentPillActive: {
    backgroundColor: colors.text.primary,
  },
  segmentLabel: {
    ...textStyles.bodyMedium,
    color: colors.text.secondary,
  },
  segmentLabelActive: {
    color: colors.neutral.white,
  },
  listContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.huge,
  },
  chatCard: {
    flexDirection: 'row',
    padding: spacing.base,
    marginBottom: spacing.base,
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.round,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -spacing.xs,
    right: -spacing.xs,
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  unreadText: {
    color: colors.neutral.white,
    fontSize: 12,
    fontWeight: '700',
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  chatName: {
    ...textStyles.bodySemiBold,
    flex: 1,
    marginRight: spacing.sm,
  },
  chatTime: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  chatFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    ...textStyles.body,
    color: colors.text.tertiary,
    flex: 1,
  },
  lastMessageUnread: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  groupIcon: {
    marginLeft: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.xxl,
  },
  emptyText: {
    ...textStyles.h2,
    marginTop: spacing.base,
  },
  emptySubtext: {
    ...textStyles.body,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
});
