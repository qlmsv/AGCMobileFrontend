import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, textStyles } from '../theme';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    errorStr?: string;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, errorStr: error.toString() };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, errorStr: undefined });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Text style={styles.title}>Something went wrong.</Text>
                    <Text style={styles.subtitle}>We're sorry for the inconvenience.</Text>
                    <Text style={styles.errorText}>{this.state.errorStr}</Text>
                    <TouchableOpacity style={styles.button} onPress={this.handleReset}>
                        <Text style={styles.buttonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    title: {
        ...textStyles.h2,
        color: colors.text.primary,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        ...textStyles.body,
        color: colors.text.secondary,
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    errorText: {
        ...textStyles.caption,
        color: colors.error,
        marginBottom: spacing.xl,
        textAlign: 'center',
    },
    button: {
        backgroundColor: colors.primary.main,
        paddingHorizontal: spacing.xl,
        height: 48,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        ...textStyles.button,
    },
});
