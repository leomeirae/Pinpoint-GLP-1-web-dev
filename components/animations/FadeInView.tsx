import React, { useEffect } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface FadeInViewProps extends ViewProps {
  /**
   * Duração da animação em ms
   * @default 600
   */
  duration?: number;
  /**
   * Delay antes de iniciar a animação em ms
   * @default 0
   */
  delay?: number;
  /**
   * Distância inicial do fade (movimento vertical)
   * @default 20
   */
  translateY?: number;
  children: React.ReactNode;
}

/**
 * FadeInView - Componente de animação fade-in com movimento vertical
 *
 * Shotsy Design: Suave entrada com easing customizado para uma sensação profissional
 *
 * @example
 * ```tsx
 * <FadeInView duration={800} delay={200}>
 *   <View>Content here</View>
 * </FadeInView>
 * ```
 */
export const FadeInView: React.FC<FadeInViewProps> = ({
  duration = 600,
  delay = 0,
  translateY = 20,
  children,
  style,
  ...props
}) => {
  const opacity = useSharedValue(0);
  const translateYValue = useSharedValue(translateY);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Easing suave
      })
    );

    translateYValue.value = withDelay(
      delay,
      withTiming(0, {
        duration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateYValue.value }],
    };
  });

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
};
