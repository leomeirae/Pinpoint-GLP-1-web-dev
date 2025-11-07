import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Switch,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { usePersonality } from '@/hooks/usePersonality';
import {
  CommunicationStyle,
  MotivationType,
  NotificationTone,
  NotificationFrequency,
  COMMUNICATION_STYLES,
  MOTIVATION_TYPES,
  NOTIFICATION_TONES,
} from '@/lib/types/communication';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { createLogger } from '@/lib/logger';

const logger = createLogger('PersonalitySelector');

interface PersonalitySelectorProps {
  onComplete?: () => void;
  showSkip?: boolean;
}

export const PersonalitySelector: React.FC<PersonalitySelectorProps> = ({
  onComplete,
  showSkip = false,
}) => {
  const { personality, updatePersonality, loading: personalityLoading } = usePersonality();
  const colors = useShotsyColors();

  const [selectedStyle, setSelectedStyle] = useState<CommunicationStyle>('friend');
  const [humorLevel, setHumorLevel] = useState(3);
  const [motivationType, setMotivationType] = useState<MotivationType>('balanced');
  const [useEmojis, setUseEmojis] = useState(true);
  const [formalityLevel, setFormalityLevel] = useState(3);
  const [notificationTone, setNotificationTone] = useState<NotificationTone>('encouraging');
  const [saving, setSaving] = useState(false);

  // Load personality data when available
  useEffect(() => {
    if (personality) {
      setSelectedStyle(personality.style);
      setHumorLevel(personality.humor_level);
      setMotivationType(personality.motivation_type);
      setUseEmojis(personality.use_emojis);
      setFormalityLevel(personality.formality_level);
      setNotificationTone(personality.notification_tone);
    }
  }, [personality]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updatePersonality({
        style: selectedStyle,
        humor_level: humorLevel,
        motivation_type: motivationType,
        use_emojis: useEmojis,
        formality_level: formalityLevel,
        notification_tone: notificationTone,
      });
      onComplete?.();
    } catch (error) {
      logger.error('Error saving personality:', error as Error);
    } finally {
      setSaving(false);
    }
  };

  const getPreviewMessage = (): string => {
    const messages: Record<CommunicationStyle, Record<MotivationType, string>> = {
      coach: {
        'data-driven': 'Your consistency score improved by 15% this week. Keep pushing!',
        emotional: "Amazing dedication this week! You're crushing your goals!",
        balanced: "Great progress! You're 15% more consistent this week.",
      },
      friend: {
        'data-driven': 'Hey! Your stats look awesome - 15% better this week!',
        emotional: "You're doing incredible! So proud of you!",
        balanced: "Nice work! You've been way more consistent lately!",
      },
      scientist: {
        'data-driven': 'Analysis shows 15% consistency improvement over 7-day period.',
        emotional: 'Positive trend detected in your commitment levels.',
        balanced: 'Your consistency increased 15% this week - notable progress.',
      },
      minimalist: {
        'data-driven': 'Consistency: +15%',
        emotional: 'Well done.',
        balanced: 'Good progress this week.',
      },
    };

    let message = messages[selectedStyle][motivationType];

    if (useEmojis && selectedStyle !== 'minimalist') {
      if (selectedStyle === 'friend') {
        message += ' 🎉';
      } else if (selectedStyle === 'coach') {
        message += ' 💪';
      }
    }

    return message;
  };

  if (personalityLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading preferences...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Communication Style</Text>
        <Text style={styles.subtitle}>Customize how Pinpoint talks to you</Text>
      </View>

      {/* Preview Box */}
      <View style={[styles.previewBox, { borderColor: colors.primary }]}>
        <Text style={styles.previewLabel}>Preview</Text>
        <Text style={styles.previewMessage}>{getPreviewMessage()}</Text>
      </View>

      {/* Communication Style */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Preferred Style</Text>
        <Text style={styles.sectionDescription}>How should we communicate with you?</Text>
        <View style={styles.styleGrid}>
          {Object.entries(COMMUNICATION_STYLES).map(([key, value]) => {
            const style = key as CommunicationStyle;
            return (
              <TouchableOpacity
                key={style}
                style={[
                  styles.styleCard,
                  selectedStyle === style && {
                    backgroundColor: colors.primary + '20',
                    borderColor: colors.primary,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setSelectedStyle(style)}
              >
                <Text
                  style={[
                    styles.styleTitle,
                    selectedStyle === style && { color: colors.primary, fontWeight: '600' },
                  ]}
                >
                  {value.label}
                </Text>
                <Text style={styles.styleDescription}>{value.description}</Text>
                <View style={styles.exampleBox}>
                  <Text style={styles.exampleLabel}>Example:</Text>
                  <Text style={styles.exampleText}>"{value.example}"</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Motivation Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Motivation Approach</Text>
        <Text style={styles.sectionDescription}>What motivates you most?</Text>
        <View style={styles.motivationGrid}>
          {Object.entries(MOTIVATION_TYPES).map(([key, value]) => {
            const type = key as MotivationType;
            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.motivationOption,
                  motivationType === type && {
                    backgroundColor: colors.primary + '20',
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setMotivationType(type)}
              >
                <Text
                  style={[
                    styles.motivationLabel,
                    motivationType === type && { color: colors.primary, fontWeight: '600' },
                  ]}
                >
                  {value.label}
                </Text>
                <Text style={styles.motivationDescription}>{value.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Humor Level */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Humor Level</Text>
        <Text style={styles.sectionDescription}>How much humor do you want in messages?</Text>
        <View style={styles.sliderContainer}>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>None</Text>
            <Text style={[styles.sliderValue, { color: colors.primary }]}>{humorLevel}/5</Text>
            <Text style={styles.sliderLabel}>Maximum</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={humorLevel}
            onValueChange={setHumorLevel}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor="#e0e0e0"
            thumbTintColor={colors.primary}
          />
        </View>
      </View>

      {/* Formality Level */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Formality Level</Text>
        <Text style={styles.sectionDescription}>How casual or formal should we be?</Text>
        <View style={styles.sliderContainer}>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>Casual</Text>
            <Text style={[styles.sliderValue, { color: colors.primary }]}>{formalityLevel}/5</Text>
            <Text style={styles.sliderLabel}>Formal</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={formalityLevel}
            onValueChange={setFormalityLevel}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor="#e0e0e0"
            thumbTintColor={colors.primary}
          />
        </View>
      </View>

      {/* Notification Tone */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Tone</Text>
        <Text style={styles.sectionDescription}>How should notifications feel?</Text>
        <View style={styles.toneGrid}>
          {Object.entries(NOTIFICATION_TONES).map(([key, value]) => {
            const tone = key as NotificationTone;
            const icons: Record<NotificationTone, string> = {
              encouraging: '💪',
              neutral: '📊',
              direct: '🎯',
              playful: '🎉',
            };

            return (
              <TouchableOpacity
                key={tone}
                style={[
                  styles.toneOption,
                  notificationTone === tone && {
                    backgroundColor: colors.primary + '20',
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setNotificationTone(tone)}
              >
                <Text style={styles.toneIcon}>{icons[tone]}</Text>
                <Text
                  style={[
                    styles.toneLabel,
                    notificationTone === tone && { color: colors.primary, fontWeight: '600' },
                  ]}
                >
                  {value.label}
                </Text>
                <Text style={styles.toneDescription}>{value.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Emoji Toggle */}
      <View style={styles.section}>
        <View style={styles.switchRow}>
          <View style={styles.switchLabel}>
            <Text style={styles.switchTitle}>Use Emojis</Text>
            <Text style={styles.switchDescription}>
              Add emojis to make messages more expressive
            </Text>
          </View>
          <Switch
            value={useEmojis}
            onValueChange={setUseEmojis}
            trackColor={{ false: '#e0e0e0', true: colors.primary + '80' }}
            thumbColor={useEmojis ? colors.primary : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          )}
        </TouchableOpacity>

        {showSkip && (
          <TouchableOpacity style={styles.skipButton} onPress={onComplete}>
            <Text style={[styles.skipButtonText, { color: colors.primary }]}>Skip for now</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>💡</Text>
        <Text style={styles.infoText}>
          These preferences affect how Shotsy communicates throughout the app, including insights,
          notifications, and celebrations. You can change them anytime in settings.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  previewBox: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  previewMessage: {
    fontSize: 16,
    color: '#1a1a1a',
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  styleGrid: {
    gap: 12,
  },
  styleCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  styleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  styleDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  exampleBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  exampleLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  motivationGrid: {
    gap: 12,
  },
  motivationOption: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  motivationLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  motivationDescription: {
    fontSize: 14,
    color: '#666',
  },
  sliderContainer: {
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 12,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 13,
    color: '#666',
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  toneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toneOption: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  toneIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  toneLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  toneDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 12,
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 12,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
});
