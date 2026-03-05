import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../utils/constants';

interface ChatInputProps {
    onSend: (text: string) => void;
}

export default function ChatInput({ onSend }: ChatInputProps) {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (text.trim().length === 0) return;
        onSend(text.trim());
        setText('');
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor={COLORS.textMuted}
                value={text}
                onChangeText={setText}
                multiline
                maxLength={1000}
            />
            <TouchableOpacity
                style={[styles.sendBtn, text.trim().length > 0 && styles.sendBtnActive]}
                onPress={handleSend}
                disabled={text.trim().length === 0}
            >
                <Text style={styles.sendText}>↑</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.sm,
        borderTopWidth: 0.5,
        borderTopColor: COLORS.border,
        backgroundColor: COLORS.background,
    },
    input: {
        flex: 1,
        backgroundColor: COLORS.inputBg,
        borderRadius: 20,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm + 2,
        color: COLORS.text,
        fontSize: 16,
        maxHeight: 100,
        marginRight: SPACING.sm,
    },
    sendBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.textMuted,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendBtnActive: {
        backgroundColor: COLORS.accent,
    },
    sendText: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: '700',
    },
});
