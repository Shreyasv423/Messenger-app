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
} from 'react-native';
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

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const user = await getCurrentUser();
            if (!user) return;
            const data = await getProfile(user.id);
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
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
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
                <ActivityIndicator size="large" color={COLORS.accent} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
            </View>

            <View style={styles.profileSection}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {profile ? getInitials(profile.username) : '?'}
                    </Text>
                </View>

                {editingUsername ? (
                    <View style={styles.editRow}>
                        <TextInput
                            style={styles.editInput}
                            value={newUsername}
                            onChangeText={setNewUsername}
                            autoFocus
                        />
                        <TouchableOpacity
                            style={styles.saveBtn}
                            onPress={handleSaveUsername}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.saveBtnText}>Save</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setEditingUsername(false);
                                setNewUsername(profile?.username || '');
                            }}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity onPress={() => setEditingUsername(true)}>
                        <Text style={styles.username}>{profile?.username || 'Unknown'}</Text>
                        <Text style={styles.editHint}>Tap to edit</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Member since</Text>
                    <Text style={styles.infoValue}>
                        {profile ? formatDate(profile.created_at) : '—'}
                    </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>User ID</Text>
                    <Text style={styles.infoValueSmall} numberOfLines={1}>
                        {profile?.id || '—'}
                    </Text>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>CryptoCalc Messenger v1.0</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
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
    profileSection: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: COLORS.accent,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    avatarText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '800',
    },
    username: {
        color: COLORS.text,
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
    },
    editHint: {
        color: COLORS.textMuted,
        fontSize: 12,
        textAlign: 'center',
        marginTop: 4,
    },
    editRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    editInput: {
        backgroundColor: COLORS.inputBg,
        borderRadius: 10,
        paddingHorizontal: SPACING.md,
        paddingVertical: 10,
        color: COLORS.text,
        fontSize: 16,
        minWidth: 150,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    saveBtn: {
        backgroundColor: COLORS.accent,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
    cancelText: {
        color: COLORS.textMuted,
        fontSize: 14,
    },
    infoSection: {
        marginHorizontal: SPACING.md,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: SPACING.md,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    infoLabel: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    infoValue: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '500',
    },
    infoValueSmall: {
        color: COLORS.textMuted,
        fontSize: 11,
        flex: 1,
        textAlign: 'right',
        marginLeft: SPACING.md,
    },
    divider: {
        height: 0.5,
        backgroundColor: COLORS.border,
    },
    actions: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingBottom: SPACING.xxl,
        paddingHorizontal: SPACING.md,
    },
    signOutBtn: {
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.error,
    },
    signOutText: {
        color: COLORS.error,
        fontSize: 16,
        fontWeight: '600',
    },
    versionText: {
        color: COLORS.textMuted,
        fontSize: 12,
        textAlign: 'center',
        marginTop: SPACING.md,
    },
});
