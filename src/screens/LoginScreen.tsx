import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { COLORS, SPACING } from '../utils/constants';
import { signIn, signUp } from '../services/authService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Auth'>;
};

export default function LoginScreen({ navigation }: Props) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (!isLogin && !username.trim()) {
            Alert.alert('Error', 'Please enter a username');
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                await signIn(email.trim(), password);
            } else {
                await signUp(email.trim(), password, username.trim());
            }
            navigation.replace('Main');
        } catch (error: any) {
            console.error('Auth error:', error);
            let message = error.message || 'Something went wrong';
            if (error.code === 'email_not_confirmed') message = 'Please confirm your email first.';
            else if (error.code === 'invalid_credentials') message = 'Invalid email or password.';
            Alert.alert('Login Failed', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.inner}
            >
                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    centerContent={true}
                >
                    <View style={styles.header}>
                        <View style={styles.logoBadge}>
                            <Ionicons name="lock-closed" size={40} color={COLORS.primary} />
                        </View>
                        <Text style={styles.title}>Private Messenger</Text>
                        <Text style={styles.subtitle}>
                            {isLogin ? 'Access your encrypted conversations' : 'Create a new secure identity'}
                        </Text>
                    </View>

                    <View style={styles.form}>
                        {!isLogin && (
                            <View style={styles.inputContainer}>
                                <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Username"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={username}
                                    onChangeText={setUsername}
                                    autoCapitalize="none"
                                />
                            </View>
                        )}
                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email address"
                                placeholderTextColor={COLORS.textMuted}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Ionicons name="key-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor={COLORS.textMuted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>
                                    {isLogin ? 'Sign In Secretly' : 'Join the Network'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.toggleBtn}
                            onPress={() => setIsLogin(!isLogin)}
                        >
                            <Text style={styles.toggleText}>
                                {isLogin
                                    ? "New here? <Text style={styles.toggleBold}>Create Account</Text>"
                                    : 'Registered already? <Text style={styles.toggleBold}>Sign In</Text>'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Spacing for mobile keyboard */}
                    <View style={{ height: 100 }} />
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.replace('Calculator')}
                    >
                        <Ionicons name="arrow-back" size={16} color={COLORS.textMuted} />
                        <Text style={styles.backText}>Exit to Calculator</Text>
                    </TouchableOpacity>

                    <View style={styles.madeByBadge}>
                        <Text style={styles.madeByText}>MADE BY <Text style={styles.brandName}>SHREYAS V</Text></Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

import { Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    inner: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 32,
        paddingTop: 80,
        paddingBottom: 40,
        flexGrow: 1,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoBadge: {
        width: 90,
        height: 90,
        borderRadius: 28,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.1)',
        elevation: 10,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    title: {
        color: COLORS.text,
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -1,
        marginBottom: 8,
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
    form: {
        gap: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.1)',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '500',
    },
    button: {
        backgroundColor: COLORS.accent,
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 12,
        elevation: 8,
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '800',
    },
    toggleBtn: {
        alignItems: 'center',
        marginTop: 10,
    },
    toggleText: {
        color: COLORS.textSecondary,
        fontSize: 15,
    },
    toggleBold: {
        color: COLORS.accent,
        fontWeight: '700',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
        padding: 10,
    },
    backText: {
        color: COLORS.textMuted,
        fontSize: 14,
        fontWeight: '600',
    },
    madeByBadge: {
        backgroundColor: 'rgba(129, 140, 248, 0.05)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },
    madeByText: {
        color: COLORS.textMuted,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.2,
    },
    brandName: {
        color: COLORS.accent,
    },
});
