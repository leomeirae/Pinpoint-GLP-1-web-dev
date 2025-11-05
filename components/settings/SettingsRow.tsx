import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';

interface SettingsRowProps {
  icon?: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  showBorder?: boolean;
  destructive?: boolean;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  label,
  value,
  onPress,
  showArrow = true,
  showSwitch = false,
  switchValue = false,
  onSwitchChange,
  showBorder = true,
  destructive = false,
}) => {
  const colors = useShotsyColors();
  const { currentAccent } = useTheme();

  const content = (
    <View
      style={[
        styles.container,
        showBorder && {
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.leftContent}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text
          style={[
            styles.label,
            { color: destructive ? colors.error : colors.text },
          ]}
        >
          {label}
        </Text>
      </View>

      <View style={styles.rightContent}>
        {value && (
          <Text style={[styles.value, { color: colors.textSecondary }]}>
            {value}
          </Text>
        )}
        {showSwitch && (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{
              false: colors.border,
              true: currentAccent + '80',
            }}
            thumbColor={switchValue ? currentAccent : colors.background}
            ios_backgroundColor={colors.border}
          />
        )}
        {showArrow && !showSwitch && (
          <Text style={[styles.arrow, { color: colors.textSecondary }]}>
            ›
          </Text>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,  // Mudança: 14 → 12px (Shotsy vertical padding)
    minHeight: 56,  // Mudança: 50 → 56px (Shotsy touch target, better UX)
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 24,
    fontWeight: '300',
  },
});
