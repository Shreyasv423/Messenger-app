import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Platform,
    Dimensions,
} from 'react-native';
import { SECRET_PIN } from '../utils/constants';
import { getCurrentUser } from '../services/authService';
import CalculatorButton from '../components/CalculatorButton';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Calculator'>;
};

export default function CalculatorScreen({ navigation }: Props) {
    const [display, setDisplay] = useState('0');
    const [previousValue, setPreviousValue] = useState<number | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [activeOperator, setActiveOperator] = useState<string | null>(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);
    const [lastResult, setLastResult] = useState<number | null>(null);
    const [lastOperator, setLastOperator] = useState<string | null>(null);
    const [lastOperand, setLastOperand] = useState<number | null>(null);
    const [clearLabel, setClearLabel] = useState('AC');

    // Track the raw digit sequence for secret PIN detection
    // Resets only when an operator or clear is pressed
    const digitSequence = useRef('');

    const calculate = useCallback((a: number, b: number, op: string): number => {
        switch (op) {
            case '+':
                return a + b;
            case '−':
                return a - b;
            case '×':
                return a * b;
            case '÷':
                return b !== 0 ? a / b : NaN; // Show "Error" on divide by zero
            default:
                return b;
        }
    }, []);

    const formatNumber = useCallback((value: string): string => {
        // Handle error states
        if (value === 'Error' || value === 'NaN' || value === 'Infinity') return 'Error';

        // If typing a decimal
        if (value.includes('.')) {
            const [intPart, decPart] = value.split('.');
            const num = parseInt(intPart, 10);
            const formattedInt = isNaN(num) ? '0' : num.toLocaleString('en-US');
            return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
        }

        const num = parseFloat(value);
        if (isNaN(num)) return '0';

        // Format large results with limited precision
        if (Math.abs(num) >= 1e16) {
            return num.toExponential(5);
        }

        // Format integer part with commas
        return num.toLocaleString('en-US', { maximumFractionDigits: 9 });
    }, []);

    const handleNumber = useCallback(
        (num: string) => {
            // Track digits for PIN
            digitSequence.current += num;

            setActiveOperator(null);
            setClearLabel('C');

            if (waitingForOperand) {
                setDisplay(num);
                setWaitingForOperand(false);
            } else {
                // Limit to 9 digits
                const currentRaw = display.replace(/,/g, '');
                if (currentRaw.replace('.', '').replace('-', '').length >= 9) return;
                setDisplay(display === '0' ? num : display + num);
            }
        },
        [display, waitingForOperand]
    );

    const handleOperator = useCallback(
        (op: string) => {
            // Reset PIN tracking when operator is pressed
            digitSequence.current = '';

            const currentRaw = display.replace(/,/g, '');
            const current = parseFloat(currentRaw);

            if (previousValue !== null && operator && !waitingForOperand) {
                const result = calculate(previousValue, current, operator);
                if (isNaN(result) || !isFinite(result)) {
                    setDisplay('Error');
                    setPreviousValue(null);
                    setOperator(null);
                    setActiveOperator(null);
                    setWaitingForOperand(true);
                    return;
                }
                setDisplay(String(result));
                setPreviousValue(result);
            } else {
                setPreviousValue(current);
            }

            setOperator(op);
            setActiveOperator(op);
            setWaitingForOperand(true);
            setClearLabel('C');
        },
        [display, previousValue, operator, waitingForOperand, calculate]
    );

    const handleEquals = useCallback(() => {
        // SECRET PIN CHECK: if the current display matches the PIN, unlock
        const rawDisplay = display.replace(/,/g, '');
        if (digitSequence.current === SECRET_PIN || rawDisplay === SECRET_PIN) {
            // Reset everything so calculator looks clean if they come back
            setDisplay('0');
            setPreviousValue(null);
            setOperator(null);
            setActiveOperator(null);
            setWaitingForOperand(false);
            setLastResult(null);
            setLastOperator(null);
            setLastOperand(null);
            setClearLabel('AC');
            digitSequence.current = '';

            // Check if user is already logged in
            getCurrentUser().then(user => {
                if (user) {
                    navigation.navigate('Main');
                } else {
                    navigation.navigate('Auth');
                }
            }).catch(() => {
                navigation.navigate('Auth');
            });
            return;
        }

        // Normal equals behavior
        digitSequence.current = '';
        const currentRaw = display.replace(/,/g, '');
        const current = parseFloat(currentRaw);

        if (previousValue !== null && operator) {
            // First press of equals
            const result = calculate(previousValue, current, operator);
            if (isNaN(result) || !isFinite(result)) {
                setDisplay('Error');
                setPreviousValue(null);
                setOperator(null);
                setLastResult(null);
                setLastOperator(null);
                setLastOperand(null);
            } else {
                setDisplay(String(result));
                setLastResult(result);
                setLastOperator(operator);
                setLastOperand(current);
                setPreviousValue(null);
                setOperator(null);
            }
        } else if (lastOperator && lastOperand !== null) {
            // Repeated equals — apply last operation again
            const result = calculate(current, lastOperand, lastOperator);
            if (isNaN(result) || !isFinite(result)) {
                setDisplay('Error');
                setLastResult(null);
                setLastOperator(null);
                setLastOperand(null);
            } else {
                setDisplay(String(result));
                setLastResult(result);
            }
        }

        setActiveOperator(null);
        setWaitingForOperand(true);
    }, [display, previousValue, operator, lastOperator, lastOperand, calculate, navigation]);

    const handleClear = useCallback(() => {
        digitSequence.current = '';

        if (clearLabel === 'C') {
            // Clear only current entry
            setDisplay('0');
            setClearLabel('AC');
            setWaitingForOperand(false);
        } else {
            // All clear
            setDisplay('0');
            setPreviousValue(null);
            setOperator(null);
            setActiveOperator(null);
            setWaitingForOperand(false);
            setLastResult(null);
            setLastOperator(null);
            setLastOperand(null);
        }
    }, [clearLabel]);

    const handleToggleSign = useCallback(() => {
        const currentRaw = display.replace(/,/g, '');
        if (currentRaw === '0') return;
        const num = parseFloat(currentRaw);
        setDisplay(String(num * -1));
    }, [display]);

    const handlePercentage = useCallback(() => {
        const currentRaw = display.replace(/,/g, '');
        const num = parseFloat(currentRaw);
        setDisplay(String(num / 100));
        setWaitingForOperand(true);
    }, [display]);

    const handleDecimal = useCallback(() => {
        setActiveOperator(null);
        setClearLabel('C');

        if (waitingForOperand) {
            setDisplay('0.');
            setWaitingForOperand(false);
            return;
        }

        if (!display.includes('.')) {
            setDisplay(display + '.');
        }
    }, [display, waitingForOperand]);

    // Dynamic font size like real iOS calculator
    const rawForFontSize = display.replace(/,/g, '').replace('-', '');
    let displayFontSize = 80;
    if (rawForFontSize.length > 6) displayFontSize = 62;
    if (rawForFontSize.length > 7) displayFontSize = 52;
    if (rawForFontSize.length > 8) displayFontSize = 44;
    if (rawForFontSize.length > 9) displayFontSize = 38;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />

            {/* Display */}
            <View style={styles.display}>
                <Text
                    style={[styles.displayText, { fontSize: displayFontSize }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.4}
                >
                    {formatNumber(display)}
                </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttons}>
                {/* Row 1: AC +/- % ÷ */}
                <View style={styles.row}>
                    <CalculatorButton label={clearLabel} onPress={handleClear} variant="special" />
                    <CalculatorButton label="⁺∕₋" onPress={handleToggleSign} variant="special" />
                    <CalculatorButton label="%" onPress={handlePercentage} variant="special" />
                    <CalculatorButton
                        label="÷"
                        onPress={() => handleOperator('÷')}
                        variant="operator"
                        isActive={activeOperator === '÷'}
                    />
                </View>

                {/* Row 2: 7 8 9 × */}
                <View style={styles.row}>
                    <CalculatorButton label="7" onPress={() => handleNumber('7')} />
                    <CalculatorButton label="8" onPress={() => handleNumber('8')} />
                    <CalculatorButton label="9" onPress={() => handleNumber('9')} />
                    <CalculatorButton
                        label="×"
                        onPress={() => handleOperator('×')}
                        variant="operator"
                        isActive={activeOperator === '×'}
                    />
                </View>

                {/* Row 3: 4 5 6 − */}
                <View style={styles.row}>
                    <CalculatorButton label="4" onPress={() => handleNumber('4')} />
                    <CalculatorButton label="5" onPress={() => handleNumber('5')} />
                    <CalculatorButton label="6" onPress={() => handleNumber('6')} />
                    <CalculatorButton
                        label="−"
                        onPress={() => handleOperator('−')}
                        variant="operator"
                        isActive={activeOperator === '−'}
                    />
                </View>

                {/* Row 4: 1 2 3 + */}
                <View style={styles.row}>
                    <CalculatorButton label="1" onPress={() => handleNumber('1')} />
                    <CalculatorButton label="2" onPress={() => handleNumber('2')} />
                    <CalculatorButton label="3" onPress={() => handleNumber('3')} />
                    <CalculatorButton
                        label="+"
                        onPress={() => handleOperator('+')}
                        variant="operator"
                        isActive={activeOperator === '+'}
                    />
                </View>

                {/* Row 5: 0 . = */}
                <View style={styles.row}>
                    <CalculatorButton label="0" onPress={() => handleNumber('0')} variant="wide" />
                    <CalculatorButton label="." onPress={handleDecimal} />
                    <CalculatorButton label="=" onPress={handleEquals} variant="operator" />
                </View>

                <View style={styles.footerBranding}>
                    <Text style={styles.madeByText}>Made by Shreyas V</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    display: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        paddingHorizontal: 28,
        paddingBottom: 8,
        minHeight: 120,
    },
    displayText: {
        color: '#ffffff',
        fontWeight: '200',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-thin',
        letterSpacing: 0,
    },
    buttons: {
        paddingHorizontal: 10,
        paddingBottom: Platform.OS === 'ios' ? 10 : 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    footerBranding: {
        marginTop: 20,
        alignItems: 'center',
        opacity: 0, // Hidden for stealth
    },
    madeByText: {
        color: 'transparent',
    },
});
