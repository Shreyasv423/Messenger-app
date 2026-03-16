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
                    <Ionicons name="add-circle" size={28} color={COLORS.primary} />
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    placeholder="Message..."
                    placeholderTextColor={COLORS.textMuted}
                    value={text}
                    onChangeText={setText}
                    multiline
                    maxLength={2000}
                />
                <View style={styles.rightIcons}>
                    {text.length === 0 ? (
                        <>
                            <TouchableOpacity style={styles.iconBtn}>
                                <Ionicons name="camera-outline" size={24} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconBtn}>
                                <Ionicons name="square-outline" size={20} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </>
                    ) : null}
                </View>
            </View>
            <TouchableOpacity
                style={[
                    styles.sendBtn,
                    { backgroundColor: text.trim() ? COLORS.primary : COLORS.surface }
                ]}
                onPress={handleSend}
                disabled={text.trim().length === 0}
            >
                <Ionicons
                    name={text.trim() ? "arrow-up" : "mic"}
                    size={24}
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.background,
        gap: 12,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.05)',
        minHeight: 52,
    },
    iconBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
        maxHeight: 120,
        paddingHorizontal: 8,
        paddingVertical: 12,
        fontWeight: '500',
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sendBtn: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
});
