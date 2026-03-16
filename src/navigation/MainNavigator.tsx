import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { MainTabParamList, ChatStackParamList } from '../types';
import { COLORS } from '../utils/constants';

const Tab = createBottomTabNavigator<MainTabParamList>();
const ChatStack = createNativeStackNavigator<ChatStackParamList>();

function ChatStackNavigator() {
    return (
        <ChatStack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: COLORS.background },
                headerTintColor: COLORS.text,
                headerShadowVisible: false,
                contentStyle: { backgroundColor: COLORS.background },
            }}
        >
            <ChatStack.Screen
                name="ChatList"
                component={ChatListScreen}
                options={{ headerShown: false }}
            />
            <ChatStack.Screen
                name="Chat"
                component={ChatScreen}
                options={{
                    headerBackTitle: 'Back',
                }}
            />
        </ChatStack.Navigator>
    );
}

export default function MainNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: COLORS.background,
                    borderTopColor: 'rgba(148, 163, 184, 0.1)',
                    borderTopWidth: 1,
                    height: Platform.OS === 'ios' ? 88 : 65,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
                    paddingTop: 10,
                    elevation: 0,
                    shadowOpacity: 0,
                    position: 'relative', // Ensure it doesn't float over mistakenly
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textMuted,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '700',
                    marginBottom: Platform.OS === 'ios' ? 0 : 5,
                },
            }}
        >
            <Tab.Screen
                name="ChatListTab"
                component={ChatStackNavigator}
                options={{
                    tabBarLabel: 'Messages',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Settings',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "person-circle" : "person-circle-outline"}
                            size={26}
                            color={color}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
