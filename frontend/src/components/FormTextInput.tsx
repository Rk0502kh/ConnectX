import React, { forwardRef, useState } from 'react';
import { StyleProp, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../theme';
import AppText from './AppText';

export type FormTextInputProps = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

/**
 * Themed text input with label and inline error support.
 * The border highlights with the indigo primary color when focused.
 */
const FormTextInput = forwardRef<TextInput, FormTextInputProps>(
  ({ label, error, style, containerStyle, onFocus, onBlur, ...rest }, ref) => {
    const [focused, setFocused] = useState(false);

    return (
      <View style={[styles.wrapper, containerStyle]}>
        {label ? (
          <AppText variant="label" style={styles.label}>
            {label}
          </AppText>
        ) : null}
        <TextInput
          ref={ref}
          placeholderTextColor={Colors.textSecondary}
          selectionColor={Colors.primary}
          style={[
            styles.input,
            focused ? styles.inputFocused : null,
            error ? styles.inputError : null,
            style,
          ]}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...rest}
        />
        {error ? (
          <AppText variant="caption" style={styles.errorText}>
            {error}
          </AppText>
        ) : null}
      </View>
    );
  }
);

export default FormTextInput;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.card,
    color: Colors.textMain,
    fontSize: Typography.fontSizeMD,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  inputFocused: {
    borderColor: Colors.primary,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    marginTop: Spacing.xs,
    color: Colors.error,
  },
});