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
    ['#38BDF8', '#0EA5E9'], // Sky
    ['#818CF8', '#6366F1'], // Indigo
    ['#C084FC', '#A855F7'], // Purple
    ['#F472B6', '#EC4899'], // Pink
    ['#FB7185', '#F43F5E'], // Rose
    ['#FB923C', '#F97316'], // Orange
    ['#FBBF24', '#F59E0B'], // Amber
    ['#34D399', '#10B981'], // Emerald
    ['#2DD4BF', '#14B8A6']  // Teal
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
    const [colorLight, colorDark] = AVATAR_COLORS[colorIndex];

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.avatarContainer, { backgroundColor: colorLight }]}>
                <Text style={styles.avatarText}>{getInitials(username)}</Text>
                {/* Online Indicator */}
                <View style={styles.onlineStatus} />
            </View>
            <View style={styles.content}>
                <View style={styles.topRow}>
                    <Text style={styles.username} numberOfLines={1}>
                        {username}
                    </Text>
                    {timestamp ? <Text style={[styles.time, isUnread && styles.unreadTime]}>{timestamp}</Text> : null}
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
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: COLORS.background,
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        position: 'relative',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '800',
    },
    onlineStatus: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: COLORS.success,
        borderWidth: 3,
        borderColor: COLORS.background,
    },
    content: {
        flex: 1,
        paddingBottom: 2,
        justifyContent: 'center',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
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
        fontWeight: '600',
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
        fontSize: 14,
        flex: 1,
        lineHeight: 18,
        fontWeight: '500',
    },
    unreadMessage: {
        color: COLORS.text,
        fontWeight: '700',
    },
    unreadBadge: {
        backgroundColor: COLORS.primary,
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
        marginLeft: 8,
        elevation: 4,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    unreadCount: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '900',
    },
});
