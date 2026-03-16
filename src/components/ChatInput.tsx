import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { COLORS, SPACING } from '../utils/constants';
import { Ionicons } from '@expo/vector-icons';

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
            <View style={styles.inputWrapper}>
                <TouchableOpacity style={styles.iconBtn}>
                    <Ionicons name="add" size={26} color={COLORS.textSecondary} />
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    placeholder="Type a message..."
                    placeholderTextColor={COLORS.textMuted}
                    value={text}
                    onChangeText={setText}
                    multiline
                    maxLength={2000}
                />
                {text.length === 0 && (
                    <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons name="images-outline" size={22} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>
            <TouchableOpacity
                style={[
                    styles.sendBtn,
                    { backgroundColor: text.trim() ? COLORS.accent : COLORS.surfaceLight }
                ]}
                onPress={handleSend}
                disabled={text.trim().length === 0}
            >
                <Ionicons
                    name={text.trim() ? "send" : "mic"}
                    size={20}
                    color={text.trim() ? "#fff" : COLORS.textMuted}
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: COLORS.background,
        gap: 8,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.05)',
    },
    iconBtn: {
        padding: 8,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
        maxHeight: 120,
        paddingHorizontal: 8,
        paddingVertical: 10,
    },
    sendBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
});
