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
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
    const [loading, setLoading] = useState(true);
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
            setLoading(false);

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

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: Platform.OS === 'ios' ? 0 : 0 }]}>
            <StatusBar barStyle="light-content" />
            
            {/* Premium Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                >
                    <Ionicons name="chevron-back" size={28} color={COLORS.text} />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.headerProfile} activeOpacity={0.7}>
                    <View style={[styles.headerAvatar, { backgroundColor: COLORS.surfaceLight }]}>
                        <Text style={styles.headerAvatarText}>
                            {otherUser.username[0].toUpperCase()}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.headerName}>{otherUser.username}</Text>
                        <View style={styles.statusContainer}>
                            <View style={styles.onlineDot} />
                            <Text style={styles.headerStatus}>Secure Node Active</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Ionicons name="videocam-outline" size={22} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Ionicons name="information-circle-outline" size={24} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color={COLORS.primary} size="large" />
                        <Text style={styles.loadingText}>Establishing Secure Connection...</Text>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={({ item }) => (
                            <MessageBubble message={item} isOwn={item.sender_id === userId} />
                        )}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.messageList}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        ListHeaderComponent={<View style={styles.encryptionBadge}>
                            <Ionicons name="lock-closed" size={12} color={COLORS.textMuted} />
                            <Text style={styles.encryptionText}>End-to-End Encrypted</Text>
                        </View>}
                    />
                )}
                
                <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 10 }]}>
                    <ChatInput onSend={handleSend} />
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

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
        paddingVertical: 14,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(148, 163, 184, 0.05)',
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerProfile: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },
    headerAvatar: {
        width: 42,
        height: 42,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.1)',
    },
    headerAvatarText: {
        color: COLORS.primary,
        fontSize: 18,
        fontWeight: '800',
    },
    headerName: {
        color: COLORS.text,
        fontSize: 17,
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
        gap: 5,
    },
    onlineDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.success,
    },
    headerStatus: {
        color: COLORS.textMuted,
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageList: {
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    encryptionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: 'rgba(148, 163, 184, 0.03)',
        alignSelf: 'center',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 0.5,
        borderColor: 'rgba(148, 163, 184, 0.05)',
    },
    encryptionText: {
        color: COLORS.textMuted,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    loadingText: {
        color: COLORS.textSecondary,
        marginTop: 16,
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    inputContainer: {
        backgroundColor: COLORS.background,
        borderTopWidth: 1,
        borderTopColor: 'rgba(148, 163, 184, 0.03)',
    },
});
