import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../utils/constants';
import { Chat } from '../types';
import { formatTimestamp, getInitials } from '../utils/helpers';

interface ChatListItemProps {
    chat: Chat;
    onPress: () => void;
}

export default function ChatListItem({ chat, onPress }: ChatListItemProps) {
    const username = chat.other_user?.username || 'Unknown';
    const lastMessage = chat.last_message?.content || 'No messages yet';
    const timestamp = chat.last_message?.created_at
        ? formatTimestamp(chat.last_message.created_at)
        : '';
    const isUnread = chat.last_message && !chat.last_message.is_read;

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(username)}</Text>
            </View>
            <View style={styles.content}>
                <View style={styles.topRow}>
                    <Text style={styles.username} numberOfLines={1}>
                        {username}
                    </Text>
                    <Text style={styles.time}>{timestamp}</Text>
                </View>
                <View style={styles.bottomRow}>
                    <Text
                        style={[styles.lastMessage, isUnread && styles.unread]}
                        numberOfLines={1}
                    >
                        {lastMessage}
                    </Text>
                    {isUnread && <View style={styles.unreadDot} />}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm + 4,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.border,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: COLORS.accent,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    avatarText: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        flex: 1,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    username: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginRight: SPACING.sm,
    },
    time: {
        color: COLORS.textMuted,
        fontSize: 12,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    lastMessage: {
        color: COLORS.textSecondary,
        fontSize: 14,
        flex: 1,
    },
    unread: {
        color: COLORS.text,
        fontWeight: '600',
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.accent,
        marginLeft: SPACING.sm,
    },
});
