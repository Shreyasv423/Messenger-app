import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    RefreshControl,
    TextInput,
    Modal,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING } from '../utils/constants';
import { Chat, User, ChatStackParamList } from '../types';
import { getChats, createChat } from '../services/chatService';
import { searchUsers } from '../services/userService';
import { getCurrentUser } from '../services/authService';
import ChatListItem from '../components/ChatListItem';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
    navigation: NativeStackNavigationProp<ChatStackParamList, 'ChatList'>;
};

export default function ChatListScreen({ navigation }: Props) {
    const [chats, setChats] = useState<Chat[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [userId, setUserId] = useState<string>('');
    const [showNewChat, setShowNewChat] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [searching, setSearching] = useState(false);

    const loadChats = useCallback(async () => {
        try {
            const user = await getCurrentUser();
            if (!user) return;
            setUserId(user.id);
            const data = await getChats(user.id);
            setChats(data);
        } catch (error: any) {
            console.error('Error loading chats:', error.message);
        }
    }, []);

    useEffect(() => {
        loadChats();
    }, [loadChats]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadChats();
        });
        return unsubscribe;
    }, [navigation, loadChats]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadChats();
        setRefreshing(false);
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        setSearching(true);
        try {
            const results = await searchUsers(query, userId);
            setSearchResults(results);
        } catch (error: any) {
            console.error('Search error:', error.message);
        } finally {
            setSearching(false);
        }
    };

    const handleNewChat = async (otherUser: User) => {
        try {
            const chat = await createChat(userId, otherUser.id);
            setShowNewChat(false);
            setSearchQuery('');
            setSearchResults([]);
            navigation.navigate('Chat', { chatId: chat.id, otherUser });
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const renderChatItem = ({ item }: { item: Chat }) => (
        <ChatListItem
            chat={item}
            onPress={() => {
                if (item.other_user) {
                    navigation.navigate('Chat', {
                        chatId: item.id,
                        otherUser: item.other_user,
                    });
                }
            }}
        />
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
            </View>

            <FlatList
                data={chats}
                renderItem={renderChatItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={chats.length === 0 ? styles.emptyContainer : undefined}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyIcon}>💬</Text>
                        <Text style={styles.emptyText}>No conversations yet</Text>
                        <Text style={styles.emptySubtext}>Start a new chat to begin messaging</Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.accent}
                    />
                }
            />

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setShowNewChat(true)}
                activeOpacity={0.8}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            {/* New Chat Modal */}
            <Modal visible={showNewChat} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>New Chat</Text>
                            <TouchableOpacity onPress={() => {
                                setShowNewChat(false);
                                setSearchQuery('');
                                setSearchResults([]);
                            }}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search users by username..."
                            placeholderTextColor={COLORS.textMuted}
                            value={searchQuery}
                            onChangeText={handleSearch}
                            autoFocus
                        />

                        {searching ? (
                            <ActivityIndicator color={COLORS.accent} style={{ marginTop: 20 }} />
                        ) : (
                            <FlatList
                                data={searchResults}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.searchResult}
                                        onPress={() => handleNewChat(item)}
                                    >
                                        <View style={styles.searchAvatar}>
                                            <Text style={styles.searchAvatarText}>
                                                {item.username[0].toUpperCase()}
                                            </Text>
                                        </View>
                                        <Text style={styles.searchUsername}>{item.username}</Text>
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    searchQuery.length >= 2 ? (
                                        <Text style={styles.noResults}>No users found</Text>
                                    ) : null
                                }
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.border,
    },
    headerTitle: {
        color: COLORS.text,
        fontSize: 28,
        fontWeight: '800',
    },
    emptyContainer: {
        flex: 1,
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyIcon: {
        fontSize: 60,
        marginBottom: SPACING.md,
    },
    emptyText: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 6,
    },
    emptySubtext: {
        color: COLORS.textMuted,
        fontSize: 14,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: COLORS.accent,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    fabText: {
        color: '#fff',
        fontSize: 30,
        fontWeight: '300',
        marginTop: -2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.xxl,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    modalTitle: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: '700',
    },
    modalClose: {
        color: COLORS.textMuted,
        fontSize: 22,
        padding: SPACING.sm,
    },
    searchInput: {
        backgroundColor: COLORS.inputBg,
        borderRadius: 12,
        paddingHorizontal: SPACING.md,
        paddingVertical: 14,
        color: COLORS.text,
        fontSize: 16,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchResult: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm + 4,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.border,
    },
    searchAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: COLORS.accent,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    searchAvatarText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    searchUsername: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '500',
    },
    noResults: {
        color: COLORS.textMuted,
        textAlign: 'center',
        marginTop: SPACING.lg,
        fontSize: 14,
    },
});
