import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../utils/constants';
import { Chat } from '../types';
import { formatTimestamp, getInitials } from '../utils/helpers';

interface ChatListItemProps {
    chat: Chat;
    onPress: () => void;
}

const AVATAR_COLORS = [
    '#38BDF8', '#818CF8', '#C084FC', '#F472B6', '#FB7185',
    '#FB923C', '#FBBF24', '#34D399', '#2DD4BF'
];

export default function ChatListItem({ chat, onPress }: ChatListItemProps) {
    const username = chat.other_user?.username || 'Unknown';
    const lastMessage = chat.last_message?.content || 'No messages yet';
    const timestamp = chat.last_message?.created_at
        ? formatTimestamp(chat.last_message.created_at)
        : '';
    const isUnread = chat.last_message && !chat.last_message.is_read;

    // Deterministic color based on username
    const colorIndex = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % AVATAR_COLORS.length;
    const avatarColor = AVATAR_COLORS[colorIndex];

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.6}>
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                <Text style={styles.avatarText}>{getInitials(username)}</Text>
                {/* Online Indicator (Static for visual quality) */}
                <View style={styles.onlineStatus} />
            </View>
            <View style={styles.content}>
                <View style={styles.topRow}>
                    <Text style={styles.username} numberOfLines={1}>
                        {username}
                    </Text>
                    <Text style={[styles.time, isUnread && styles.unreadTime]}>{timestamp}</Text>
                </View>
                <View style={styles.bottomRow}>
                    <Text
                        style={[styles.lastMessage, isUnread && styles.unreadMessage]}
                        numberOfLines={1}
                    >
                        {lastMessage}
                    </Text>
                    {isUnread && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadCount}>1</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: COLORS.background,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        position: 'relative',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '700',
    },
    onlineStatus: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: COLORS.success,
        borderWidth: 2,
        borderColor: COLORS.background,
    },
    content: {
        flex: 1,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(148, 163, 184, 0.1)', // Subtle border
        paddingBottom: 12,
        height: '100%',
        justifyContent: 'center',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    username: {
        color: COLORS.text,
        fontSize: 17,
        fontWeight: '700',
        flex: 1,
        marginRight: 8,
    },
    time: {
        color: COLORS.textMuted,
        fontSize: 12,
        fontWeight: '500',
    },
    unreadTime: {
        color: COLORS.primary,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    lastMessage: {
        color: COLORS.textSecondary,
        fontSize: 15,
        flex: 1,
        lineHeight: 20,
    },
    unreadMessage: {
        color: COLORS.text,
        fontWeight: '600',
    },
    unreadBadge: {
        backgroundColor: COLORS.primary,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
        marginLeft: 8,
    },
    unreadCount: {
        color: COLORS.background,
        fontSize: 11,
        fontWeight: '800',
    },
});
