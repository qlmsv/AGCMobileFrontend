import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import * as SplashScreenFn from 'expo-splash-screen';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
    onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
    useEffect(() => {
        // Hide the native splash screen and show this one
        // In a real app we might verify auth, load data, etc.
        const prepare = async () => {
            await SplashScreenFn.hideAsync();
            // Simulate a delay or wait for parent to call onFinish
            if (onFinish) {
                setTimeout(onFinish, 2000); // Show for 2 seconds
            }
        };
        prepare();
    }, [onFinish]);

    return (
        <View style={styles.container}>
            <Image
                source={require('../../../assets/splash_logo_figma.png')}
                style={styles.logo}
                resizeMode="contain"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 119,
        height: 120,
    },
});
