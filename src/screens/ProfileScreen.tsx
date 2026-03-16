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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../utils/constants';
import { User } from '../types';
import { getProfile, updateProfile } from '../services/userService';
import { getCurrentUser, signOut } from '../services/authService';
import { formatDate, getInitials } from '../utils/helpers';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
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
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        Alert.alert('Sign Out', 'Are you sure you want to exit your profile?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
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
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Account</Text>
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
                            <Ionicons name="camera" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {editingUsername ? (
                        <View style={styles.editCard}>
                            <TextInput
                                style={styles.editInput}
                                value={newUsername}
                                onChangeText={setNewUsername}
                                placeholder="Username"
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
                                        <Text style={styles.saveBtnText}>Save Changes</Text>
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
                            <Text style={styles.username}>{profile?.username || 'Unknown'}</Text>
                            <TouchableOpacity
                                style={styles.editNameBtn}
                                onPress={() => setEditingUsername(true)}
                            >
                                <Ionicons name="pencil" size={14} color={COLORS.primary} />
                                <Text style={styles.editBtnText}>Edit Profile</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={styles.settingsSection}>
                    <Text style={styles.sectionLabel}>Personal Information</Text>
                    <View style={styles.settingsCard}>
                        <View style={styles.settingItem}>
                            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} style={styles.settingIcon} />
                            <View style={styles.settingContent}>
                                <Text style={styles.settingLabel}>Joined Messenger</Text>
                                <Text style={styles.settingValue}>
                                    {profile ? formatDate(profile.created_at) : '—'}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.settingItem}>
                            <Ionicons name="key-outline" size={20} color={COLORS.accent} style={styles.settingIcon} />
                            <View style={styles.settingContent}>
                                <Text style={styles.settingLabel}>Security ID</Text>
                                <Text style={styles.settingValue} numberOfLines={1}>
                                    {profile?.id}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.sectionLabel}>Preferences</Text>
                    <View style={styles.settingsCard}>
                        <TouchableOpacity style={styles.settingItem}>
                            <Ionicons name="notifications-outline" size={20} color={COLORS.success} style={styles.settingIcon} />
                            <View style={styles.settingContent}>
                                <Text style={styles.settingLabel}>Notifications</Text>
                                <Text style={styles.settingValue}>Enabled</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.settingItem}>
                            <Ionicons name="lock-closed-outline" size={20} color={COLORS.warning} style={styles.settingIcon} />
                            <View style={styles.settingContent}>
                                <Text style={styles.settingLabel}>Privacy & Security</Text>
                                <Text style={styles.settingValue}>Encrypted</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
                    <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
                    <Text style={styles.signOutText}>Sign Out of Messenger</Text>
                </TouchableOpacity>

                <View style={styles.footerBranding}>
                    <View style={styles.brandingBadge}>
                        <Text style={styles.madeByText}>MADE BY <Text style={styles.brandName}>SHREYAS V</Text></Text>
                    </View>
                    <Text style={styles.versionText}>v1.0.0 Alpha • Secure Node</Text>
                </View>
            </ScrollView>
        </View>
    );
}

import { Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native';

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
        paddingTop: 10,
        paddingBottom: 16,
    },
    headerTitle: {
        color: COLORS.text,
        fontSize: 32,
        fontWeight: '800',
    },
    scrollContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    profileHero: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 20,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: COLORS.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(129, 140, 248, 0.2)',
    },
    avatarEditBtn: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        backgroundColor: COLORS.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: COLORS.background,
    },
    avatarText: {
        color: COLORS.primary,
        fontSize: 40,
        fontWeight: '800',
    },
    userNameSection: {
        alignItems: 'center',
    },
    username: {
        color: COLORS.text,
        fontSize: 28,
        fontWeight: '800',
    },
    editNameBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        gap: 6,
    },
    editBtnText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '700',
    },
    editCard: {
        width: '100%',
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    editInput: {
        backgroundColor: COLORS.inputBg,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: COLORS.text,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    editActions: {
        flexDirection: 'row',
        gap: 12,
    },
    saveBtn: {
        flex: 1,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 15,
    },
    cancelBtn: {
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    cancelText: {
        color: COLORS.textMuted,
        fontSize: 15,
        fontWeight: '600',
    },
    settingsSection: {
        marginBottom: 32,
    },
    sectionLabel: {
        color: COLORS.textMuted,
        fontSize: 13,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginLeft: 4,
        marginBottom: 12,
        marginTop: 16,
    },
    settingsCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.05)',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
    },
    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(148, 163, 184, 0.05)',
        textAlign: 'center',
        lineHeight: 40,
    },
    settingContent: {
        flex: 1,
    },
    settingLabel: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '600',
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
        marginLeft: 72,
    },
    signOutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 18,
        borderRadius: 24,
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        marginBottom: 20,
    },
    signOutText: {
        color: COLORS.error,
        fontSize: 16,
        fontWeight: '800',
    },
    footerBranding: {
        alignItems: 'center',
        paddingVertical: 12,
        marginBottom: Platform.OS === 'ios' ? 0 : 10,
    },
    brandingBadge: {
        backgroundColor: 'rgba(129, 140, 248, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 8,
    },
    madeByText: {
        color: COLORS.textSecondary,
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1,
    },
    brandName: {
        color: COLORS.accent,
    },
    versionText: {
        color: COLORS.textMuted,
        fontSize: 12,
        fontWeight: '600',
    },
});
