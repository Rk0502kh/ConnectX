import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../theme';

type Variant = 'primary' | 'outline' | 'danger';

export type PrimaryButtonProps = TouchableOpacityProps & {
  title: string;
  loading?: boolean;
  variant?: Variant;
};

/**
 * Themed button component used across the whole app.
 * - primary -> indigo (Deep Indigo #4F46E5)
 * - outline -> transparent with indigo border
 * - danger  -> red (#EF4444)
 */
export default function PrimaryButton({
  title,
  loading = false,
  variant = 'primary',
  disabled,
  style,
  ...rest
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      style={[
        styles.base,
        variant === 'outline' ? styles.outline : variant === 'danger' ? styles.danger : styles.primary,
        isDisabled ? styles.disabled : null,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.textOnPrimary : Colors.primary} />
      ) : (
        <Text
          style={[
            styles.text,
            variant === 'outline' ? styles.textOutline : variant === 'danger' ? styles.textDanger : styles.textPrimary,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: Colors.error,
  },
  disabled: {
    opacity: 0.55,
  },
  text: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightBold,
  },
  textPrimary: {
    color: Colors.textOnPrimary,
  },
  textOutline: {
    color: Colors.primary,
  },
  textDanger: {
    color: Colors.textOnPrimary,
  },
});