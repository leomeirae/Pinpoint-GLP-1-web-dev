// components/coachmarks/CoachmarkOverlay.tsx
// Overlay visual para coachmarks com spotlight e tooltip

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Defs, Mask, Rect, Circle } from 'react-native-svg';
import { X, CaretLeft, CaretRight } from 'phosphor-react-native';
import { useColors } from '@/hooks/useShotsyColors';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { useCoachmarks, CoachmarkElement } from './CoachmarkSystem';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SPOTLIGHT_PADDING = 8;
const TOOLTIP_MAX_WIDTH = SCREEN_WIDTH - 48;

interface CoachmarkOverlayProps {
  visible: boolean;
  coachmark: CoachmarkElement | null;
  totalCoachmarks: number;
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

export function CoachmarkOverlay({
  visible,
  coachmark,
  totalCoachmarks,
  currentIndex,
  onNext,
  onPrev,
  onSkip,
}: CoachmarkOverlayProps) {
  const colors = useColors();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && coachmark) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, coachmark, fadeAnim]);

  if (!visible || !coachmark) {
    return null;
  }

  const spotlightX = coachmark.x - SPOTLIGHT_PADDING;
  const spotlightY = coachmark.y - SPOTLIGHT_PADDING;
  const spotlightWidth = coachmark.width + SPOTLIGHT_PADDING * 2;
  const spotlightHeight = coachmark.height + SPOTLIGHT_PADDING * 2;
  const spotlightRadius = Math.max(spotlightWidth, spotlightHeight) / 2 + 4;

  // Calcular posição do tooltip (acima ou abaixo do spotlight)
  const tooltipY =
    spotlightY + spotlightHeight + 16 < SCREEN_HEIGHT - 200
      ? spotlightY + spotlightHeight + 16
      : spotlightY - 150 > 0
      ? spotlightY - 150
      : SCREEN_HEIGHT / 2;

  const isLast = currentIndex === totalCoachmarks - 1;
  const isFirst = currentIndex === 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onSkip}
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Overlay escuro com spotlight */}
        <View style={styles.overlay}>
          <Svg height={SCREEN_HEIGHT} width={SCREEN_WIDTH}>
            <Defs>
              <Mask id="mask">
                <Rect height={SCREEN_HEIGHT} width={SCREEN_WIDTH} fill="white" />
                <Circle
                  cx={spotlightX + spotlightWidth / 2}
                  cy={spotlightY + spotlightHeight / 2}
                  r={spotlightRadius}
                  fill="black"
                />
              </Mask>
            </Defs>
            <Rect
              height={SCREEN_HEIGHT}
              width={SCREEN_WIDTH}
              fill="rgba(0, 0, 0, 0.85)"
              mask="url(#mask)"
            />
          </Svg>
        </View>

        {/* Tooltip */}
        <View
          style={[
            styles.tooltip,
            {
              top: tooltipY,
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header com título e botão skip */}
          <View style={styles.tooltipHeader}>
            <View style={styles.tooltipTitleContainer}>
              <Text
                style={[styles.tooltipTitle, { color: colors.text }]}
                accessibilityRole="header"
                accessibilityLabel={coachmark.title}
              >
                {coachmark.title}
              </Text>
              <Text style={[styles.tooltipProgress, { color: colors.textSecondary }]}>
                {currentIndex + 1}/{totalCoachmarks}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onSkip}
              style={styles.skipButton}
              accessibilityRole="button"
              accessibilityLabel="Pular tour"
              accessibilityHint="Fechar o tour de orientação"
            >
              <X size={20} color={colors.textSecondary} weight="bold" />
            </TouchableOpacity>
          </View>

          {/* Descrição */}
          <Text
            style={[styles.tooltipDescription, { color: colors.textSecondary }]}
            accessibilityLabel={coachmark.description}
          >
            {coachmark.description}
          </Text>

          {/* Botões de navegação */}
          <View style={styles.tooltipFooter}>
            <TouchableOpacity
              onPress={onPrev}
              disabled={isFirst}
              style={[
                styles.navButton,
                { backgroundColor: colors.backgroundSecondary },
                isFirst && styles.navButtonDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Anterior"
              accessibilityHint="Ver dica anterior"
              accessibilityState={{ disabled: isFirst }}
            >
              <CaretLeft
                size={20}
                color={isFirst ? colors.textMuted : colors.text}
                weight="bold"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onNext}
              style={[
                styles.primaryButton,
                {
                  backgroundColor: colors.primary,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={isLast ? 'Entendi' : 'Próximo'}
              accessibilityHint={
                isLast ? 'Concluir tour de orientação' : 'Ver próxima dica'
              }
            >
              <Text style={[styles.primaryButtonText, { color: colors.background }]}>
                {isLast ? 'Entendi' : 'Próximo'}
              </Text>
              {!isLast && (
                <CaretRight size={20} color={colors.background} weight="bold" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  tooltip: {
    position: 'absolute',
    left: 24,
    right: 24,
    maxWidth: TOOLTIP_MAX_WIDTH,
    alignSelf: 'center',
    borderRadius: ShotsyDesignTokens.borderRadius.xl,
    padding: ShotsyDesignTokens.spacing.lg,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ShotsyDesignTokens.spacing.md,
  },
  tooltipTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ShotsyDesignTokens.spacing.sm,
  },
  tooltipTitle: {
    ...ShotsyDesignTokens.typography.h4,
    flex: 1,
  },
  tooltipProgress: {
    ...ShotsyDesignTokens.typography.caption,
  },
  skipButton: {
    padding: 4,
    marginLeft: ShotsyDesignTokens.spacing.sm,
  },
  tooltipDescription: {
    ...ShotsyDesignTokens.typography.body,
    marginBottom: ShotsyDesignTokens.spacing.lg,
    lineHeight: 22,
  },
  tooltipFooter: {
    flexDirection: 'row',
    gap: ShotsyDesignTokens.spacing.md,
  },
  navButton: {
    height: 44,
    width: 44,
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  primaryButton: {
    flex: 1,
    height: 44,
    borderRadius: ShotsyDesignTokens.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  primaryButtonText: {
    ...ShotsyDesignTokens.typography.button,
  },
});

