import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    Dimensions,
    Platform,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BUTTON_MARGIN = 6;
const BUTTONS_PER_ROW = 4;
const TOTAL_PADDING = 16 * 2; // container padding
const TOTAL_MARGINS = BUTTON_MARGIN * 2 * BUTTONS_PER_ROW;
const BUTTON_SIZE = (SCREEN_WIDTH - TOTAL_PADDING - TOTAL_MARGINS) / BUTTONS_PER_ROW;

interface CalculatorButtonProps {
    label: string;
    onPress: () => void;
    variant?: 'number' | 'operator' | 'special' | 'wide';
    isActive?: boolean;
}

export default function CalculatorButton({
    label,
    onPress,
    variant = 'number',
    isActive = false,
}: CalculatorButtonProps) {
    const isWide = variant === 'wide';

    const getBgColor = () => {
        if (variant === 'operator') {
            return isActive ? '#ffffff' : '#ff9f0a';
        }
        if (variant === 'special') return '#a5a5a5';
        return '#333333';
    };

    const getTextColor = () => {
        if (variant === 'operator') {
            return isActive ? '#ff9f0a' : '#ffffff';
        }
        if (variant === 'special') return '#000000';
        return '#ffffff';
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    backgroundColor: getBgColor(),
                    width: isWide ? BUTTON_SIZE * 2 + BUTTON_MARGIN * 2 : BUTTON_SIZE,
                    height: BUTTON_SIZE,
                    borderRadius: BUTTON_SIZE / 2,
                },
                isWide && styles.wide,
            ]}
            onPress={onPress}
            activeOpacity={0.6}
        >
            <Text
                style={[
                    styles.text,
                    { color: getTextColor() },
                    variant === 'operator' && styles.operatorText,
                    variant === 'special' && styles.specialText,
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: BUTTON_MARGIN,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.15,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    wide: {
        alignItems: 'flex-start',
        paddingLeft: BUTTON_SIZE * 0.36,
    },
    text: {
        fontSize: 34,
        fontWeight: '400',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
    },
    operatorText: {
        fontSize: 38,
        fontWeight: '300',
    },
    specialText: {
        fontSize: 28,
        fontWeight: '500',
    },
});
