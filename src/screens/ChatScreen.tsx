import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    SafeAreaView,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../utils/constants';
import { Message, ChatStackParamList, User } from '../types';
import { getMessages, sendMessage, subscribeToMessages, unsubscribe } from '../services/messageService';
import { getCurrentUser } from '../services/authService';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

type Props = {
    navigation: NativeStackNavigationProp<ChatStackParamList, 'Chat'>;
    route: RouteProp<ChatStackParamList, 'Chat'>;
};

export default function ChatScreen({ navigation, route }: Props) {
    const { chatId, otherUser } = route.params;
    const [messages, setMessages] = useState<Message[]>([]);
    const [userId, setUserId] = useState<string>('');
    const flatListRef = useRef<FlatList>(null);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        let channelRef: any = null;

        const init = async () => {
            const user = await getCurrentUser();
            if (!user) return;
            setUserId(user.uid);

            const existingMessages = await getMessages(chatId);
            setMessages(existingMessages);

            channelRef = subscribeToMessages(chatId, (newMessage) => {
                setMessages((prev) => {
                    if (prev.find((m) => m.id === newMessage.id)) return prev;
                    return [...prev, newMessage];
                });
            });
        };

        init();

        return () => {
            if (channelRef) unsubscribe(channelRef);
        };
    }, [chatId]);

    const handleSend = async (content: string) => {
        try {
            const newMsg = await sendMessage(chatId, userId, content);
            setMessages((prev) => {
                if (prev.find((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
            });
        } catch (error: any) {
            console.error('Send error:', error.message);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <MessageBubble message={item} isOwn={item.sender_id === userId} />
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {
                        if (navigation.canGoBack()) {
                            navigation.goBack();
                        } else {
                            navigation.navigate('ChatList' as any);
                        }
                    }}
                    style={styles.backBtn}
                >
                    <Ionicons name="chevron-back" size={28} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.headerProfile}>
                    <View style={[styles.headerAvatar, { backgroundColor: COLORS.surfaceLight }]}>
                        <Text style={styles.headerAvatarText}>
                            {otherUser.username[0].toUpperCase()}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.headerName}>{otherUser.username}</Text>
                        <Text style={styles.headerStatus}>Online</Text>
                    </View>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
                        <Ionicons name="call-outline" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'rgba(129, 140, 248, 0.1)' }]}>
                        <Ionicons name="videocam-outline" size={22} color={COLORS.accent} />
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <View style={styles.emptyIconCircle}>
                                <Ionicons name="chatbubbles-outline" size={60} color={COLORS.textMuted} />
                            </View>
                            <Text style={styles.emptyText}>Start a Secret Chat</Text>
                            <Text style={styles.emptySubtext}>Messages are end-to-end encrypted</Text>
                        </View>
                    }
                />
                <ChatInput onSend={handleSend} />
            </KeyboardAvoidingView>
        </View>
    );
}

import { Ionicons } from '@expo/vector-icons';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    flex: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(148, 163, 184, 0.05)',
    },
    backBtn: {
        padding: 4,
    },
    headerProfile: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    headerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerAvatarText: {
        color: COLORS.primary,
        fontSize: 20,
        fontWeight: '700',
    },
    headerName: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: '700',
    },
    headerStatus: {
        color: COLORS.success,
        fontSize: 12,
        fontWeight: '600',
        marginTop: 1,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageList: {
        paddingVertical: 10,
        paddingHorizontal: 8,
        paddingBottom: 20, // Space for the input bar
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 120,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyText: {
        color: COLORS.text,
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 8,
    },
    emptySubtext: {
        color: COLORS.textSecondary,
        fontSize: 15,
        fontWeight: '500',
    },
});
