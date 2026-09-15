import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors, Typography } from '../theme';

type AvatarProps = {
  name?: string | null;
  /** Diameter of the avatar in pixels. */
  size?: number;
  /** When true, renders a green online-status dot (#22C55E). */
  online?: boolean | null;
  style?: StyleProp<ViewStyle>;
};

/**
 * Circular avatar showing initials; supports the online-status indicator.
 */
export default function Avatar({ name, size = 48, online, style }: AvatarProps) {
  const initials = getInitials(name);

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.4 }]}>{initials}</Text>
      {online ? (
        <View
          style={[
            styles.dot,
            {
              width: size * 0.24,
              height: size * 0.24,
              borderRadius: size * 0.12,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

function getInitials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: Colors.textOnPrimary,
    fontWeight: Typography.fontWeightBold,
  },
  dot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: Colors.online,
    borderWidth: 2,
    borderColor: Colors.card,
  },
});