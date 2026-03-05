import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../utils/constants';
import { onAuthStateChange, getCurrentUser } from '../services/authService';
import SplashScreen from '../screens/SplashScreen';
import CalculatorScreen from '../screens/CalculatorScreen';
import LoginScreen from '../screens/LoginScreen';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: COLORS.background },
                animation: 'fade',
            }}
        >
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen
                name="Calculator"
                component={CalculatorScreen}
                options={{ gestureEnabled: false }}
            />
            <Stack.Screen
                name="Auth"
                component={LoginScreen}
                options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
                name="Main"
                component={MainNavigator}
                options={{ gestureEnabled: false }}
            />
        </Stack.Navigator>
    );
}
