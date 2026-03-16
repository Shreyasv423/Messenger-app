import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    Dimensions,
    Platform,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const IS_WEB = Platform.OS === 'web';
const BUTTON_MARGIN = SCREEN_WIDTH > 600 ? 6 : 6;
const BUTTONS_PER_ROW = 4;
const TOTAL_PADDING = 16 * 2;
const TOTAL_MARGINS = BUTTON_MARGIN * 2 * BUTTONS_PER_ROW;
const CALCULATED_SIZE = (SCREEN_WIDTH - TOTAL_PADDING - TOTAL_MARGINS) / BUTTONS_PER_ROW;
// On web/large screens, make buttons much smaller
const BUTTON_SIZE = IS_WEB ? 70 : (SCREEN_WIDTH > 600 ? Math.min(CALCULATED_SIZE, 80) : CALCULATED_SIZE);

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
        fontSize: BUTTON_SIZE * 0.45,
        fontWeight: '400',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
    },
    operatorText: {
        fontSize: BUTTON_SIZE * 0.5,
        fontWeight: '300',
    },
    specialText: {
        fontSize: BUTTON_SIZE * 0.35,
        fontWeight: '500',
    },
});
