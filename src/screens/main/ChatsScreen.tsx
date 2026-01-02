import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { chatService } from '../../services/chatService';
import { ChatList } from '../../types';
import { EmptyState } from '../../components';
import { logger } from '../../utils/logger';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const ChatsScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const [chats, setChats] = useState<ChatList[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

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

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchChats();
    };

    useFocusEffect(
        useCallback(() => {
            fetchChats();
        }, [])
    );

    const renderChatItem = ({ item }: { item: ChatList }) => (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => navigation.navigate('ChatDetail', { chatId: item.id })}
        >
            <Image
                source={{ uri: item.display_avatar || undefined }}
                style={styles.avatar}
            />
            <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                    <Text style={styles.chatTitle} numberOfLines={1}>{item.display_title || 'Chat'}</Text>
                    {/* Time would go here if available in list model */}
                    {/* <Text style={styles.timeText}>12:30</Text> */}
                </View>
                <View style={styles.chatFooter}>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.last_message ? 'Latest message...' : 'No messages yet'}
                    </Text>
                    {parseInt(item.unread_count) > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>{item.unread_count}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Messages</Text>
            </View>

            {isLoading && chats.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                </View>
            ) : (
                <FlatList
                    data={chats}
                    renderItem={renderChatItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />
                    }
                    ListEmptyComponent={
                        <EmptyState
                            title="No Messages"
                            message="You haven't started any chats yet."
                            icon="chatbubble-ellipses-outline"
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    header: {
        padding: spacing.base,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
        backgroundColor: colors.background.default,
    },
    title: {
        ...textStyles.h2,
        color: colors.text.primary,
    },
    listContent: {
        paddingVertical: spacing.sm,
    },
    chatItem: {
        flexDirection: 'row',
        padding: spacing.base,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
        alignItems: 'center',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.neutral[200],
    },
    chatInfo: {
        flex: 1,
        marginLeft: spacing.base,
        justifyContent: 'center',
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    chatTitle: {
        ...textStyles.h4,
        color: colors.text.primary,
        flex: 1,
    },
    timeText: {
        ...textStyles.caption,
        color: colors.text.tertiary,
    },
    chatFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        ...textStyles.body,
        color: colors.text.secondary,
        flex: 1,
        marginRight: spacing.sm,
    },
    unreadBadge: {
        backgroundColor: colors.primary.main,
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        minWidth: 20,
        alignItems: 'center',
    },
    unreadText: {
        fontSize: 10,
        color: colors.text.inverse,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        padding: spacing.xl,
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        ...textStyles.body,
        color: colors.text.tertiary,
    },
});
