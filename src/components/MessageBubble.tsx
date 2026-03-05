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
                <Text style={[styles.time, isOwn ? styles.ownTime : styles.otherTime]}>{time}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SPACING.md,
        marginVertical: 2,
    },
    ownContainer: {
        alignItems: 'flex-end',
    },
    otherContainer: {
        alignItems: 'flex-start',
    },
    bubble: {
        maxWidth: '78%',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm + 2,
        borderRadius: 20,
    },
    ownBubble: {
        backgroundColor: COLORS.accent,
        borderBottomRightRadius: 6,
    },
    otherBubble: {
        backgroundColor: COLORS.received,
        borderBottomLeftRadius: 6,
    },
    text: {
        fontSize: 15,
        lineHeight: 20,
    },
    ownText: {
        color: '#ffffff',
    },
    otherText: {
        color: COLORS.text,
    },
    time: {
        fontSize: 11,
        marginTop: 4,
    },
    ownTime: {
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'right',
    },
    otherTime: {
        color: COLORS.textMuted,
    },
});
