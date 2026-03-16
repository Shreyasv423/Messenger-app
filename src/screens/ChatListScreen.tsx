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
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    const insets = useSafeAreaInsets();

    const loadChats = useCallback(async () => {
        try {
            const user = await getCurrentUser();
            if (!user) return;
            setUserId(user.uid);
            const data = await getChats(user.uid);
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

    useEffect(() => {
        if (showNewChat) {
            handleSearch('');
        }
    }, [showNewChat]);

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
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Messages</Text>
                    <Text style={styles.headerSubtitle}>Recent Conversations</Text>
                </View>
                <TouchableOpacity style={styles.headerIcon}>
                    <Ionicons name="ellipsis-vertical" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchBarContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={COLORS.textMuted} />
                    <Text style={styles.searchPlaceholder}>Search for chats...</Text>
                </View>
            </View>

            <FlatList
                data={chats}
                renderItem={renderChatItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={chats.length === 0 ? styles.emptyContainer : styles.listContent}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <View style={styles.emptyCircle}>
                            <Ionicons name="chatbubbles-outline" size={80} color={COLORS.primary} />
                        </View>
                        <Text style={styles.emptyText}>Empty Inbox</Text>
                        <Text style={styles.emptySubtext}>Your private messages will appear here. Start a new one!</Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.primary}
                    />
                }
            />

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setShowNewChat(true)}
                activeOpacity={0.8}
            >
                <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
            </TouchableOpacity>

            {/* New Chat Modal (Bottom Sheet style) */}
            <Modal visible={showNewChat} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalDismisContainer}
                        activeOpacity={1}
                        onPress={() => setShowNewChat(false)}
                    />
                    <View style={styles.modalContent}>
                        <View style={styles.modalDragHandle} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>New Conversation</Text>
                            <TouchableOpacity style={styles.closeBtn} onPress={() => {
                                setShowNewChat(false);
                                setSearchQuery('');
                                setSearchResults([]);
                            }}>
                                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalSearchWrapper}>
                            <Ionicons name="search" size={20} color={COLORS.textMuted} style={styles.modalSearchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search by name..."
                                placeholderTextColor={COLORS.textMuted}
                                value={searchQuery}
                                onChangeText={handleSearch}
                                autoFocus
                            />
                        </View>

                        {searching ? (
                            <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
                        ) : (
                            <View style={{ flex: 1 }}>
                                {searchQuery === '' && searchResults.length > 0 && (
                                    <Text style={styles.sectionTitle}>People You Might Know</Text>
                                )}
                                <FlatList
                                    data={searchResults}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.searchResult}
                                            onPress={() => handleNewChat(item)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={[styles.searchAvatar, { backgroundColor: COLORS.surfaceLight }]}>
                                                <Text style={styles.searchAvatarText}>
                                                    {item.username[0].toUpperCase()}
                                                </Text>
                                            </View>
                                            <View style={styles.searchInfo}>
                                                <Text style={styles.searchUsername}>{item.username}</Text>
                                                <Text style={styles.searchStatus}>Available</Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                                        </TouchableOpacity>
                                    )}
                                    ListEmptyComponent={
                                        <View style={styles.modalEmpty}>
                                            <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
                                            <Text style={styles.noResults}>
                                                {searchQuery.length > 0 ? "No users found" : "No other users registered yet"}
                                            </Text>
                                        </View>
                                    }
                                />
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

import { Ionicons } from '@expo/vector-icons';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        color: COLORS.text,
        fontSize: 34,
        fontWeight: '800',
        letterSpacing: -1,
    },
    headerSubtitle: {
        color: COLORS.textMuted,
        fontSize: 14,
        fontWeight: '600',
        marginTop: 2,
    },
    headerIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBarContainer: {
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    searchBar: {
        backgroundColor: COLORS.surface,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        gap: 12,
    },
    searchPlaceholder: {
        color: COLORS.textMuted,
        fontSize: 15,
        fontWeight: '500',
    },
    listContent: {
        paddingBottom: 110,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    empty: {
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(56, 189, 248, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyText: {
        color: COLORS.text,
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 12,
    },
    emptySubtext: {
        color: COLORS.textSecondary,
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        fontWeight: '500',
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 24,
        width: 65,
        height: 65,
        borderRadius: 32.5,
        backgroundColor: COLORS.accent,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        zIndex: 999,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'flex-end',
    },
    modalDismisContainer: {
        flex: 1,
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 40,
        height: '85%',
    },
    modalDragHandle: {
        width: 40,
        height: 5,
        backgroundColor: COLORS.border,
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        color: COLORS.text,
        fontSize: 26,
        fontWeight: '800',
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalSearchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.inputBg,
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    modalSearchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 14,
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '500',
    },
    searchResult: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(148, 163, 184, 0.05)',
    },
    searchAvatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    searchAvatarText: {
        color: COLORS.primary,
        fontSize: 22,
        fontWeight: '700',
    },
    searchInfo: {
        flex: 1,
    },
    searchUsername: {
        color: COLORS.text,
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 2,
    },
    searchStatus: {
        color: COLORS.success,
        fontSize: 13,
        fontWeight: '600',
    },
    sectionTitle: {
        color: COLORS.textMuted,
        fontSize: 13,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 16,
        marginTop: 8,
    },
    modalEmpty: {
        alignItems: 'center',
        marginTop: 60,
        opacity: 0.5,
    },
    noResults: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 16,
        fontSize: 16,
        fontWeight: '500',
    },
});
