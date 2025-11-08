import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface ConfettiPieceProps {
  delay: number;
  color: string;
  startX: number;
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ delay, color, startX }) => {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Movimento vertical (queda)
    translateY.value = withDelay(
      delay,
      withTiming(height + 50, {
        duration: 3000 + Math.random() * 1000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );

    // Movimento horizontal (oscilação)
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-30 + Math.random() * 20, { duration: 800 }),
          withTiming(30 + Math.random() * 20, { duration: 800 })
        ),
        -1,
        true
      )
    );

    // Rotação
    rotate.value = withDelay(
      delay,
      withRepeat(
        withTiming(360, {
          duration: 1500 + Math.random() * 1000,
          easing: Easing.linear,
        }),
        -1
      )
    );

    // Fade out no final
    opacity.value = withDelay(
      delay + 2500,
      withTiming(0, { duration: 500 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: startX + translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        { backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
};

interface ConfettiCelebrationProps {
  /**
   * Callback quando a animação termina
   */
  onComplete?: () => void;
  /**
   * Número de confetti pieces
   * @default 30
   */
  count?: number;
  /**
   * Cores do confetti
   * @default Shotsy colors
   */
  colors?: string[];
}

/**
 * ConfettiCelebration - Animação de confetti para celebrações
 *
 * Shotsy Design: Celebração visual ao atingir metas importantes
 *
 * @example
 * ```tsx
 * {showConfetti && (
 *   <ConfettiCelebration
 *     count={50}
 *     onComplete={() => setShowConfetti(false)}
 *   />
 * )}
 * ```
 */
export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  onComplete,
  count = 30,
  colors = [
    '#F97316', // Orange
    '#FBBF24', // Yellow
    '#10B981', // Green
    '#3B82F6', // Blue
    '#06B6D4', // Cyan
    '#A855F7', // Purple
    '#EC4899', // Pink
  ],
}) => {
  useEffect(() => {
    // Haptic feedback ao iniciar
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Callback após animação
    if (onComplete) {
      const timer = setTimeout(onComplete, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  const confettiPieces = Array.from({ length: count }, (_, i) => ({
    id: i,
    delay: Math.random() * 500,
    color: colors[Math.floor(Math.random() * colors.length)],
    startX: Math.random() * width,
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {confettiPieces.map((piece) => (
        <ConfettiPiece
          key={piece.id}
          delay={piece.delay}
          color={piece.color}
          startX={piece.startX}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  confettiPiece: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 2,
  },
});
