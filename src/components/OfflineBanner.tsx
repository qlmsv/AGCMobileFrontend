import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, textStyles, spacing } from '../theme';

export const OfflineBanner = () => {
    const [isConnected, setIsConnected] = useState<boolean | null>(true);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });
        return () => unsubscribe();
    }, []);

    if (isConnected !== false) {
        return null;
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Text style={styles.text}>No Internet Connection</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.error,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xs,
        width: '100%',
        zIndex: 999,
    },
    text: {
        ...textStyles.caption,
        color: 'white',
        fontWeight: 'bold',
    },
});
