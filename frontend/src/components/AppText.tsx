import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { Colors, Typography } from '../theme';

type Variant = 'title' | 'heading' | 'body' | 'caption' | 'label';

export type AppTextProps = TextProps & {
  variant?: Variant;
  /** Optional override for the default text color. */
  color?: string;
};

/**
 * Typography component that maps semantic variants to the ConnectX palette.
 */
export default function AppText({ variant = 'body', color, style, ...rest }: AppTextProps) {
  return (
    <Text
      style={[styles.base, styles[variant], color ? { color } : null, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: Typography.fontSizeMD,
    color: Colors.textMain,
  },
  title: {
    fontSize: Typography.fontSizeXL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.primaryDark,
  },
  heading: {
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textMain,
  },
  body: {
    fontSize: Typography.fontSizeMD,
    color: Colors.textMain,
  },
  caption: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textSecondary,
  },
  label: {
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textSecondary,
  },
});