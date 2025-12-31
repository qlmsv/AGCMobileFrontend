import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { textStyles } from '../theme';

interface RatingProps {
    rating: number;
    size?: number;
    color?: string;
    showText?: boolean;
}

export const Rating: React.FC<RatingProps> = ({
    rating,
    size = 14,
    color = '#FFC107',
    showText = true
}) => {
    return (
        <View style={styles.container}>
            <Ionicons name="star" size={size} color={color} />
            {showText && (
                <Text style={[styles.ratingText, { fontSize: size }]}>
                    {rating.toFixed(1)}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        ...textStyles.caption,
        fontWeight: '600',
        color: '#333', // Default text color if not themed
    },
});
