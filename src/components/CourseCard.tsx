import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, spacing, borderRadius, textStyles } from '../theme';
import { Course } from '../types';
import { Rating } from './Rating';
import { Ionicons } from '@expo/vector-icons';
import { courseService } from '../services/courseService';
import { logger } from '../utils/logger';
import { secureImageUrl } from '../utils/secureUrl';
import { useIAPPrice } from '../hooks/useIAPPrice';

interface CourseCardProps {
  course: Course;
  onPress: (course: Course) => void;
  variant?: 'horizontal' | 'vertical';
  showFavorite?: boolean;
  onFavoriteChange?: () => void;
  testID?: string;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onPress,
  variant = 'vertical',
  showFavorite = true,
  onFavoriteChange,
  testID,
}) => {
  const isHorizontal = variant === 'horizontal';
  const [isFavorite, setIsFavorite] = useState(course.is_favourite || false);
  const [isToggling, setIsToggling] = useState(false);
  const { displayPrice, isLoading: isPriceLoading } = useIAPPrice(course);

  const handleToggleFavorite = async () => {
    if (isToggling) return;
    setIsToggling(true);

    try {
      if (isFavorite) {
        await courseService.removeFromFavourites(course.id);
        setIsFavorite(false);
      } else {
        await courseService.addToFavourites(course.id);
        setIsFavorite(true);
      }
      onFavoriteChange?.();
    } catch (error) {
      logger.error('Failed to toggle favorite:', error);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, isHorizontal ? styles.cardHorizontal : styles.cardVertical]}
      onPress={() => onPress(course)}
      activeOpacity={0.7}
      testID={testID}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: secureImageUrl(course.cover) }}
          style={[styles.image, isHorizontal ? styles.imageHorizontal : styles.imageVertical]}
          resizeMode="cover"
        />
        {showFavorite && (
          <TouchableOpacity
            testID="course-fav-icon"
            style={styles.favoriteButton}
            onPress={handleToggleFavorite}
            disabled={isToggling}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? colors.primary.main : colors.text.inverse}
            />
          </TouchableOpacity>
        )}
      </View>
      <View
        style={[styles.content, isHorizontal ? styles.contentHorizontal : styles.contentVertical]}
      >
        <View>
          <Text style={styles.category}>{course.category?.name || 'General'}</Text>
          <Text style={styles.title} numberOfLines={2}>
            {course.title}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.price}>
            {isPriceLoading ? '...' : displayPrice}
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
  imageContainer: {
    position: 'relative',
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
  favoriteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
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
