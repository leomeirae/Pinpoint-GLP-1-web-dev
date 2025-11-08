import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ScalePressProps extends TouchableOpacityProps {
  /**
   * Escala ao pressionar (0-1)
   * @default 0.95
   */
  scaleValue?: number;
  /**
   * Habilitar haptic feedback
   * @default true
   */
  hapticFeedback?: boolean;
  /**
   * Tipo de haptic feedback
   * @default 'light'
   */
  hapticType?: 'light' | 'medium' | 'heavy' | 'selection';
  /**
   * Usar spring animation (bounce effect)
   * @default true
   */
  useSpring?: boolean;
  children: React.ReactNode;
}

/**
 * ScalePress - TouchableOpacity com animação de escala e haptic feedback
 *
 * Shotsy Design: Microinteração sutil que dá feedback visual e tátil
 *
 * @example
 * ```tsx
 * <ScalePress onPress={handlePress} scaleValue={0.92} hapticType="medium">
 *   <View style={styles.button}>
 *     <Text>Press me</Text>
 *   </View>
 * </ScalePress>
 * ```
 */
export const ScalePress: React.FC<ScalePressProps> = ({
  scaleValue = 0.95,
  hapticFeedback = true,
  hapticType = 'light',
  useSpring = true,
  onPressIn,
  onPressOut,
  onPress,
  children,
  style,
  ...props
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = (e: any) => {
    if (useSpring) {
      scale.value = withSpring(scaleValue, {
        damping: 15,
        stiffness: 300,
      });
    } else {
      scale.value = withTiming(scaleValue, { duration: 100 });
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    if (useSpring) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 300,
      });
    } else {
      scale.value = withTiming(1, { duration: 100 });
    }
    onPressOut?.(e);
  };

  const handlePress = (e: any) => {
    if (hapticFeedback) {
      const hapticMap = {
        light: Haptics.ImpactFeedbackStyle.Light,
        medium: Haptics.ImpactFeedbackStyle.Medium,
        heavy: Haptics.ImpactFeedbackStyle.Heavy,
        selection: undefined,
      };

      if (hapticType === 'selection') {
        Haptics.selectionAsync();
      } else {
        Haptics.impactAsync(hapticMap[hapticType]!);
      }
    }
    onPress?.(e);
  };

  return (
    <AnimatedTouchable
      activeOpacity={0.8}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[animatedStyle, style]}
      {...props}
    >
      {children}
    </AnimatedTouchable>
  );
};
