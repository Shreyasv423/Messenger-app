import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../utils/constants';
import { Message } from '../types';

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
    const time = new Date(message.created_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    return (
        <View style={[styles.container, isOwn ? styles.ownContainer : styles.otherContainer]}>
            <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
                <Text style={[styles.text, isOwn ? styles.ownText : styles.otherText]}>
                    {message.content}
                </Text>
                <View style={styles.footerRow}>
                    <Text style={[styles.time, isOwn ? styles.ownTime : styles.otherTime]}>{time}</Text>
                    {isOwn && <Text style={styles.readIcon}>✓✓</Text>}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 12,
        marginVertical: 4,
        width: '100%',
    },
    ownContainer: {
        alignItems: 'flex-end',
    },
    otherContainer: {
        alignItems: 'flex-start',
    },
    bubble: {
        maxWidth: '82%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 24,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    ownBubble: {
        backgroundColor: COLORS.accent,
        borderBottomRightRadius: 6,
    },
    otherBubble: {
        backgroundColor: COLORS.surface,
        borderBottomLeftRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.15)',
    },
    text: {
        fontSize: 15.5,
        lineHeight: 22,
        fontWeight: '500',
    },
    ownText: {
        color: '#FFFFFF',
    },
    otherText: {
        color: COLORS.text,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 4,
        gap: 6,
    },
    time: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    ownTime: {
        color: 'rgba(255,255,255,0.8)',
    },
    otherTime: {
        color: COLORS.textMuted,
    },
    readIcon: {
        fontSize: 11,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.9)',
    },
});
