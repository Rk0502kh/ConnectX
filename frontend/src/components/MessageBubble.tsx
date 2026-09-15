import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BorderRadius, Colors, Spacing } from '../theme';
import { formatTime } from '../utils/format';
import AppText from './AppText';

export type MessageBubbleProps = {
  /** True for the current user's messages (indigo bubble). */
  mine: boolean;
  content: string;
  timestamp?: string;
  senderName?: string;
};

/**
 * Chat bubble: indigo for the current user, light gray for everyone else.
 * Matches the ConnectX palette (user bubble #4F46E5, other bubble #E2E8F0).
 */
export default function MessageBubble({ mine, content, timestamp, senderName }: MessageBubbleProps) {
  return (
    <View style={[styles.row, mine ? styles.rowMine : styles.rowOther]}>
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
        {!mine && senderName ? (
          <AppText variant="caption" style={styles.senderName}>
            {senderName}
          </AppText>
        ) : null}
        <AppText style={[styles.message, mine ? styles.messageMine : null]}>{content}</AppText>
        {timestamp ? (
          <AppText variant="caption" style={[styles.time, mine ? styles.timeMine : null]}>
            {formatTime(timestamp)}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: Spacing.xs,
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  rowOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
  },
  bubbleMine: {
    backgroundColor: Colors.userBubble,
    borderBottomRightRadius: BorderRadius.sm,
  },
  bubbleOther: {
    backgroundColor: Colors.otherBubble,
    borderBottomLeftRadius: BorderRadius.sm,
  },
  senderName: {
    color: Colors.primary,
    marginBottom: 2,
    fontWeight: '600',
  },
  message: {
    fontSize: 16,
    color: Colors.textMain,
  },
  messageMine: {
    color: Colors.userBubbleText,
  },
  time: {
    alignSelf: 'flex-end',
    marginTop: 4,
    color: Colors.textSecondary,
  },
  timeMine: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
});