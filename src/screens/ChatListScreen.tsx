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
    StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" />
            
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Messages</Text>
                    <View style={styles.statusIndicator}>
                        <View style={styles.onlineDot} />
                        <Text style={styles.headerSubtitle}>Encrypted Network Online</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.headerIcon}>
                    <Ionicons name="search" size={22} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={chats}
                renderItem={({ item }) => (
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
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={chats.length === 0 ? styles.emptyContainer : styles.listContent}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <View style={styles.emptyCircle}>
                            <Ionicons name="chatbubble-ellipses-outline" size={70} color={COLORS.primary} />
                        </View>
                        <Text style={styles.emptyText}>No Active Nodes</Text>
                        <Text style={styles.emptySubtext}>Start a new end-to-end encrypted conversation.</Text>
                        <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowNewChat(true)}>
                            <Text style={styles.emptyBtnText}>New Conversation</Text>
                        </TouchableOpacity>
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
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>

            {/* New Chat Modal (Premium Overlay) */}
            <Modal visible={showNewChat} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalDismisContainer}
                        activeOpacity={1}
                        onPress={() => setShowNewChat(false)}
                    />
                    <View style={styles.modalContent}>
                        <View style={styles.modalDragHandle} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Identity</Text>
                            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowNewChat(false)}>
                                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalSearchWrapper}>
                            <Ionicons name="at-outline" size={20} color={COLORS.textMuted} style={styles.modalSearchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search by username..."
                                placeholderTextColor={COLORS.textMuted}
                                value={searchQuery}
                                onChangeText={handleSearch}
                                autoFocus
                            />
                        </View>

                        {searching ? (
                            <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
                        ) : (
                            <FlatList
                                data={searchResults}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={{ paddingBottom: 40 }}
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
                                            <Text style={styles.searchStatus}>Available for Secure Chat</Text>
                                        </View>
                                        <View style={styles.searchAction}>
                                            <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
                                        </View>
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    <View style={styles.modalEmpty}>
                                        <Ionicons name="search-outline" size={48} color={COLORS.textMuted} />
                                        <Text style={styles.noResults}>
                                            {searchQuery.length > 0 ? "Identity not found" : "Search to begin"}
                                        </Text>
                                    </View>
                                }
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        color: COLORS.text,
        fontSize: 34,
        fontWeight: '900',
        letterSpacing: -1,
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 6,
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.success,
    },
    headerSubtitle: {
        color: COLORS.textMuted,
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    headerIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.05)',
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
        paddingHorizontal: 48,
    },
    emptyCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(56, 189, 248, 0.03)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 28,
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.05)',
    },
    emptyText: {
        color: COLORS.text,
        fontSize: 26,
        fontWeight: '900',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    emptySubtext: {
        color: COLORS.textSecondary,
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        fontWeight: '500',
        marginBottom: 32,
    },
    emptyBtn: {
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.2)',
    },
    emptyBtnText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '800',
    },
    fab: {
        position: 'absolute',
        bottom: Platform.OS === 'web' ? 40 : 30,
        right: 24,
        width: 68,
        height: 68,
        borderRadius: 24,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 12,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        zIndex: 999,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'flex-end',
    },
    modalDismisContainer: {
        flex: 1,
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 40,
        height: '85%',
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.05)',
    },
    modalDragHandle: {
        width: 36,
        height: 5,
        backgroundColor: COLORS.border,
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 28,
    },
    modalTitle: {
        color: COLORS.text,
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: COLORS.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalSearchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: 18,
        paddingHorizontal: 16,
        marginBottom: 28,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.05)',
    },
    modalSearchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 16,
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
    },
    searchResult: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(148, 163, 184, 0.03)',
    },
    searchAvatar: {
        width: 56,
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    searchAvatarText: {
        color: COLORS.primary,
        fontSize: 22,
        fontWeight: '800',
    },
    searchInfo: {
        flex: 1,
    },
    searchUsername: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 2,
    },
    searchStatus: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontWeight: '600',
    },
    searchAction: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(56, 189, 248, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalEmpty: {
        alignItems: 'center',
        marginTop: 80,
    },
    noResults: {
        color: COLORS.textMuted,
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
