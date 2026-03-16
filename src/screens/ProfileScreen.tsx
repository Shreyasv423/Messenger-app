import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    Platform,
    ScrollView,
    StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../utils/constants';
import { User } from '../types';
import { getProfile, updateProfile } from '../services/userService';
import { getCurrentUser, signOut } from '../services/authService';
import { formatDate, getInitials } from '../utils/helpers';
import { CommonActions, useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
    const navigation = useNavigation<any>();
    const [profile, setProfile] = useState<User | null>(null);
    const [editingUsername, setEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const user = await getCurrentUser();
            if (!user) return;
            const data = await getProfile(user.uid);
            setProfile(data);
            setNewUsername(data?.username || '');
        } catch (error: any) {
            console.error('Error loading profile:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveUsername = async () => {
        if (!profile || !newUsername.trim()) return;
        setSaving(true);
        try {
            const updated = await updateProfile(profile.id, {
                username: newUsername.trim(),
            });
            setProfile(updated);
            setEditingUsername(false);
            Alert.alert('Success', 'Secure Identity Updated');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        Alert.alert('De-authenticate', 'Disconnect this node from the network?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Disconnect',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await signOut();
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: 'Calculator' }],
                            })
                        );
                    } catch (error: any) {
                        Alert.alert('Error', error.message);
                    }
                },
            },
        ]);
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" />
            
            <View style={styles.header}>
                <Text style={styles.headerTitle}>System Node</Text>
                <View style={styles.nodeBadge}>
                    <Text style={styles.nodeBadgeText}>ACTIVE SESSION</Text>
                </View>
            </View>

            <ScrollView
                style={styles.flex}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.profileHero}>
                    <View style={styles.avatarWrapper}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {profile ? getInitials(profile.username) : '?'}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.avatarEditBtn}>
                            <Ionicons name="shield" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {editingUsername ? (
                        <View style={styles.editCard}>
                            <TextInput
                                style={styles.editInput}
                                value={newUsername}
                                onChangeText={setNewUsername}
                                placeholder="Edit Identity"
                                placeholderTextColor={COLORS.textMuted}
                                autoFocus
                            />
                            <View style={styles.editActions}>
                                <TouchableOpacity
                                    style={styles.saveBtn}
                                    onPress={handleSaveUsername}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.saveBtnText}>Update</Text>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.cancelBtn}
                                    onPress={() => {
                                        setEditingUsername(false);
                                        setNewUsername(profile?.username || '');
                                    }}
                                >
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.userNameSection}>
                            <Text style={styles.username}>{profile?.username || 'Unknown Node'}</Text>
                            <TouchableOpacity
                                style={styles.editNameBtn}
                                onPress={() => setEditingUsername(true)}
                            >
                                <Ionicons name="finger-print-outline" size={14} color={COLORS.primary} />
                                <Text style={styles.editBtnText}>Modify Node Identity</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={styles.settingsSection}>
                    <Text style={styles.sectionLabel}>Node Configuration</Text>
                    <View style={styles.settingsCard}>
                        <View style={styles.settingItem}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
                                <Ionicons name="hardware-chip-outline" size={20} color={COLORS.primary} />
                            </View>
                            <View style={styles.settingContent}>
                                <Text style={styles.settingLabel}>Entry Date</Text>
                                <Text style={styles.settingValue}>
                                    {profile ? formatDate(profile.created_at) : '—'}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.settingItem}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(129, 140, 248, 0.1)' }]}>
                                <Ionicons name="finger-print" size={20} color={COLORS.accent} />
                            </View>
                            <View style={styles.settingContent}>
                                <Text style={styles.settingLabel}>Node UUID</Text>
                                <Text style={styles.settingValue} numberOfLines={1}>
                                    {profile?.id}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.sectionLabel}>Security Protocol</Text>
                    <View style={styles.settingsCard}>
                        <TouchableOpacity style={styles.settingItem}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                <Ionicons name="notifications-outline" size={20} color={COLORS.success} />
                            </View>
                            <View style={styles.settingContent}>
                                <Text style={styles.settingLabel}>Alerts</Text>
                                <Text style={styles.settingValue}>Encrypted Signals</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.settingItem}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                                <Ionicons name="lock-closed-outline" size={20} color={COLORS.warning} />
                            </View>
                            <View style={styles.settingContent}>
                                <Text style={styles.settingLabel}>Encryption</Text>
                                <Text style={styles.settingValue}>AES-256 Enabled</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
                    <Ionicons name="power-outline" size={20} color={COLORS.error} />
                    <Text style={styles.signOutText}>Disconnect and Cloak</Text>
                </TouchableOpacity>

                <View style={styles.footerBranding}>
                    <Text style={styles.versionText}>SECURE MESSENGER ENGINE • v1.0.4 FINAL</Text>
                    <Text style={styles.brandName}>SHREYAS V SYSTEMS</Text>
                </View>
            </ScrollView>
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
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        color: COLORS.text,
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -1,
    },
    nodeBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    nodeBadgeText: {
        color: COLORS.success,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    profileHero: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 24,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 40,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.1)',
        elevation: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    avatarEditBtn: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: COLORS.primary,
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: COLORS.background,
    },
    avatarText: {
        color: COLORS.primary,
        fontSize: 48,
        fontWeight: '900',
    },
    userNameSection: {
        alignItems: 'center',
    },
    username: {
        color: COLORS.text,
        fontSize: 30,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    editNameBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 14,
        backgroundColor: COLORS.surface,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.05)',
    },
    editBtnText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '800',
    },
    editCard: {
        width: '100%',
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.1)',
    },
    editInput: {
        backgroundColor: COLORS.background,
        borderRadius: 14,
        paddingHorizontal: 18,
        paddingVertical: 16,
        color: COLORS.text,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.05)',
    },
    editActions: {
        flexDirection: 'row',
        gap: 12,
    },
    saveBtn: {
        flex: 1,
        backgroundColor: COLORS.primary,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 15,
    },
    cancelBtn: {
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    cancelText: {
        color: COLORS.textMuted,
        fontSize: 15,
        fontWeight: '700',
    },
    settingsSection: {
        marginBottom: 32,
    },
    sectionLabel: {
        color: COLORS.textMuted,
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginLeft: 4,
        marginBottom: 16,
        marginTop: 16,
    },
    settingsCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 28,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.05)',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        gap: 18,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingContent: {
        flex: 1,
    },
    settingLabel: {
        color: COLORS.textMuted,
        fontSize: 13,
        fontWeight: '800',
    },
    settingValue: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '700',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(148, 163, 184, 0.03)',
        marginLeft: 80,
    },
    signOutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 20,
        borderRadius: 24,
        backgroundColor: 'rgba(239, 68, 68, 0.04)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.1)',
        marginBottom: 40,
    },
    signOutText: {
        color: COLORS.error,
        fontSize: 17,
        fontWeight: '900',
        letterSpacing: -0.3,
    },
    footerBranding: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    versionText: {
        color: COLORS.textMuted,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 6,
    },
    brandName: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
    },
});
