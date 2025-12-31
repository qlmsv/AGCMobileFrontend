import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, spacing, borderRadius, textStyles } from '../theme';
import { Course } from '../types';
import { Rating } from './Rating';

interface CourseCardProps {
    course: Course;
    onPress: (course: Course) => void;
    variant?: 'horizontal' | 'vertical';
}

export const CourseCard: React.FC<CourseCardProps> = ({
    course,
    onPress,
    variant = 'vertical'
}) => {
    const isHorizontal = variant === 'horizontal';

    return (
        <TouchableOpacity
            style={[
                styles.card,
                isHorizontal ? styles.cardHorizontal : styles.cardVertical
            ]}
            onPress={() => onPress(course)}
            activeOpacity={0.7}
        >
            <Image
                source={{ uri: course.cover || 'https://via.placeholder.com/150' }}
                style={[
                    styles.image,
                    isHorizontal ? styles.imageHorizontal : styles.imageVertical
                ]}
            />
            <View style={[
                styles.content,
                isHorizontal ? styles.contentHorizontal : styles.contentVertical
            ]}>
                <View>
                    <Text style={styles.category}>
                        {course.category?.name || 'General'}
                    </Text>
                    <Text style={styles.title} numberOfLines={2}>
                        {course.title}
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.price}>
                        {course.is_free ? 'Free' : (course.price ? `$${course.price}` : 'Free')}
                    </Text>
                    <Rating rating={course.rating || 5.0} />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.background.default,
        borderRadius: borderRadius.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    cardVertical: {
        width: 260,
        marginBottom: 4,
    },
    cardHorizontal: {
        flexDirection: 'row',
        padding: spacing.sm,
        marginBottom: spacing.md,
        marginHorizontal: spacing.base,
    },
    image: {
        backgroundColor: colors.neutral[200],
    },
    imageVertical: {
        width: '100%',
        height: 140,
        borderTopLeftRadius: borderRadius.lg,
        borderTopRightRadius: borderRadius.lg,
    },
    imageHorizontal: {
        width: 100,
        height: 100,
        borderRadius: borderRadius.md,
    },
    content: {
        justifyContent: 'space-between',
    },
    contentVertical: {
        padding: spacing.md,
    },
    contentHorizontal: {
        flex: 1,
        marginLeft: spacing.md,
        paddingVertical: spacing.xs,
    },
    category: {
        ...textStyles.caption,
        color: colors.primary.main,
        marginBottom: 4,
    },
    title: {
        ...textStyles.h4,
        color: colors.text.primary,
        lineHeight: 20,
        marginBottom: spacing.xs,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    price: {
        ...textStyles.h4,
        color: colors.text.primary,
    },
});
