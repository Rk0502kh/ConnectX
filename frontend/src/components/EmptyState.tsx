import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors, Spacing } from '../theme';
import AppText from './AppText';

export type EmptyStateProps = {
  icon?: string;
  title: string;
  subtitle?: string;
};

/**
 * Friendly empty state used across list screens (white card on soft-white bg).
 */
export default function EmptyState({ icon = '💬', title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <AppText style={styles.icon}>{icon}</AppText>
      <AppText variant="heading" style={styles.title}>
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="caption" style={styles.subtitle}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  icon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});