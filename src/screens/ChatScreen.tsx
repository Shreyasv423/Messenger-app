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

    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <View style={styles.headerTitle}>
                    <View style={styles.headerAvatar}>
                        <Text style={styles.headerAvatarText}>
                            {otherUser.username[0].toUpperCase()}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.headerName}>{otherUser.username}</Text>
                        <Text style={styles.headerStatus}>Online</Text>
                    </View>
                </View>
            ),
        });
    }, [navigation, otherUser]);

    useEffect(() => {
        let channelRef: any = null;

        const init = async () => {
            const user = await getCurrentUser();
            if (!user) return;
            setUserId(user.id);

            // Load existing messages
            const existingMessages = await getMessages(chatId);
            setMessages(existingMessages);

            // Subscribe to new messages
            channelRef = subscribeToMessages(chatId, (newMessage) => {
                setMessages((prev) => {
                    // Prevent duplicates
                    if (prev.find((m) => m.id === newMessage.id)) return prev;
                    return [...prev, newMessage];
                });
            });
        };

        init();

        return () => {
            if (channelRef) {
                unsubscribe(channelRef);
            }
        };
    }, [chatId]);

    const handleSend = async (content: string) => {
        try {
            const newMsg = await sendMessage(chatId, userId, content);
            // Optimistic update (will be deduped by realtime)
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
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={90}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() =>
                        flatListRef.current?.scrollToEnd({ animated: true })
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyText}>No messages yet</Text>
                            <Text style={styles.emptySubtext}>Say hello! 👋</Text>
                        </View>
                    }
                />
                <ChatInput onSend={handleSend} />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAvatar: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: COLORS.accent,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    headerAvatarText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    headerName: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
    },
    headerStatus: {
        color: COLORS.success,
        fontSize: 12,
    },
    messageList: {
        paddingVertical: SPACING.sm,
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 4,
    },
    emptySubtext: {
        color: COLORS.textMuted,
        fontSize: 14,
    },
});
