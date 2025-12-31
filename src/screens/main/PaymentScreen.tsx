import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, spacing, textStyles } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

export const PaymentScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { url } = route.params;
    const [isLoading, setIsLoading] = useState(true);

    const handleNavigationStateChange = (navState: any) => {
        // Detect success or cancel URLs if your backend redirects there
        // For example:
        // if (navState.url.includes('success')) handleSuccess();
        // if (navState.url.includes('cancel')) handleCancel();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>Payment</Text>
            </View>

            <View style={styles.webviewContainer}>
                <WebView
                    source={{ uri: url }}
                    onLoadStart={() => setIsLoading(true)}
                    onLoadEnd={() => setIsLoading(false)}
                    onNavigationStateChange={handleNavigationStateChange}
                    style={styles.webview}
                />
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={colors.primary.main} />
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.base,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    closeButton: {
        marginRight: spacing.md,
    },
    title: {
        ...textStyles.h3,
        color: colors.text.primary,
    },
    webviewContainer: {
        flex: 1,
        position: 'relative',
    },
    webview: {
        flex: 1,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background.card,
    },
});
