import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { supabase } from '@/lib/supabase';
import { useColors } from '@/hooks/useShotsyColors';
import { createLogger } from '@/lib/logger';

const logger = createLogger('BasicInfoStep');

interface BasicInfoStepProps {
  onComplete: () => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ onComplete }) => {
  const colors = useColors();
  const { user } = useUser();

  const [name, setName] = useState(user?.fullName || user?.firstName || '');
  const [currentWeight, setCurrentWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter your name');
      return;
    }

    if (!currentWeight || !goalWeight) {
      Alert.alert('Missing Information', 'Please enter your current and goal weight');
      return;
    }

    const current = parseFloat(currentWeight);
    const goal = parseFloat(goalWeight);

    if (isNaN(current) || isNaN(goal) || current <= 0 || goal <= 0) {
      Alert.alert('Invalid Values', 'Please enter valid weight values');
      return;
    }

    try {
      setLoading(true);

      // Create or update profile in Supabase
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user?.id,
        name: name.trim(),
        email: user?.primaryEmailAddress?.emailAddress || '',
        start_weight: current,
        target_weight: goal,
      });

      if (profileError) throw profileError;

      // Create initial weight log
      const { error: weightError } = await supabase.from('weights').insert({
        user_id: user?.id,
        date: new Date().toISOString(),
        weight: current,
        notes: 'Initial weight',
      });

      if (weightError) {
        // Don't fail if weight already exists
        logger.warn('Weight log error', { weightError });
      }

      // Create default settings
      const { error: settingsError } = await supabase.from('settings').upsert({
        user_id: user?.id,
      });

      if (settingsError) {
        logger.warn('Settings error', { settingsError });
      }

      onComplete();
    } catch (error: any) {
      logger.error('Error saving basic info:', error as Error);
      Alert.alert('Error', 'Failed to save your information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const weightDifference =
    currentWeight && goalWeight ? Math.abs(parseFloat(currentWeight) - parseFloat(goalWeight)) : 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Message */}
        <View style={styles.welcomeBox}>
          <Text style={styles.emoji}>👋</Text>
          <Text style={styles.welcomeText}>Let's personalize Pinpoint for you!</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>What should we call you?</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor="#999"
              autoCapitalize="words"
              autoComplete="name"
            />
          </View>

          {/* Current Weight */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={currentWeight}
              onChangeText={setCurrentWeight}
              placeholder="e.g., 85.5"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
            />
          </View>

          {/* Goal Weight */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Goal Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={goalWeight}
              onChangeText={setGoalWeight}
              placeholder="e.g., 75.0"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
            />
          </View>

          {/* Preview */}
          {weightDifference > 0 && (
            <View style={[styles.previewCard, { backgroundColor: colors.primary + '10' }]}>
              <Text style={styles.previewLabel}>Your Journey</Text>
              <Text style={styles.previewNumbers}>
                <Text style={styles.currentWeight}>{currentWeight} kg</Text>
                <Text style={styles.arrow}> → </Text>
                <Text style={[styles.goalWeight, { color: colors.primary }]}>{goalWeight} kg</Text>
              </Text>
              <Text style={styles.difference}>Goal: {weightDifference.toFixed(1)} kg to go!</Text>
            </View>
          )}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            This helps us personalize your experience and track your progress. You can always update
            these later!
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: colors.primary }]}
          onPress={handleContinue}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeBox: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    gap: 20,
    marginBottom: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  previewCard: {
    padding: 20,
    borderRadius: 12, // Mudança: 16 → 12px (design system)
    alignItems: 'center',
    marginTop: 8,
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  previewNumbers: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  currentWeight: {
    color: '#666',
  },
  arrow: {
    color: '#999',
  },
  goalWeight: {
    fontWeight: 'bold',
  },
  difference: {
    fontSize: 15,
    color: '#666',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
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
  continueButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
