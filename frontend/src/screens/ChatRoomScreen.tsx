import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import api, { WS_BASE_URL } from '../services/api';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import MessageBubble from '../components/MessageBubble';
import FormTextInput from '../components/FormTextInput';
import EmptyState from '../components/EmptyState';
import { Colors, Spacing } from '../theme';
import type { Message } from '../types';

type UiMessage = {
  key: string;
  senderId: number;
  content: string;
  timestamp?: string;
};

export default function ChatRoomScreen({ route, navigation }: any) {
  const { chatId, title } = route.params;
  const { userId } = useContext(AuthContext);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const listRef = useRef<FlatList<UiMessage>>(null);

  useEffect(() => {
    navigation.setOptions({ title: title ?? 'Chat' });
  }, [navigation, title]);

  // Load message history from the REST API.
  useEffect(() => {
    let cancelled = false;
    const loadHistory = async () => {
      try {
        const response = await api.get(`/api/chats/${chatId}/messages?page=1&size=50`);
        if (cancelled) return;
        const data = response.data?.data ?? [];
        const history: UiMessage[] = (Array.isArray(data) ? data : []).map((m: Message) => ({
          key: `rest-${m.id}`,
          senderId: Number(m.sender?.id),
          content: m.messageText ?? '',
          timestamp: m.sentAt,
        }));
        setMessages(history);
      } catch (error: any) {
        if (!cancelled) {
          Alert.alert('Error', error.response?.data?.message || 'Failed to load messages');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadHistory();
    return () => {
      cancelled = true;
    };
  }, [chatId]);

  // Real-time messages over the WebSocket.
  useEffect(() => {
    let ws: WebSocket | null = null;
    let closed = false;

    AsyncStorage.getItem('userToken').then((token) => {
      if (closed || !token) return;
      ws = new WebSocket(`${WS_BASE_URL}/ws/chat?token=${encodeURIComponent(token)}`);
      wsRef.current = ws;

      ws.onopen = () => {
        // Socket ready; messages will be sent over this channel.
      };
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'CHAT_MESSAGE' && Number(data.chatId) === Number(chatId)) {
            setMessages((prev) => [
              ...prev,
              {
                key: `ws-${Date.now()}-${Math.random()}`,
                senderId: Number(data.senderId),
                content: data.content ?? '',
                timestamp: data.timestamp ?? new Date().toISOString(),
              },
            ]);
          }
        } catch (err) {
          console.warn('Failed to parse websocket message', err);
        }
      };
      ws.onclose = () => {
        wsRef.current = null;
      };
    });

    return () => {
      closed = true;
      if (ws) ws.close();
      wsRef.current = null;
    };
  }, [chatId]);

  const sendMessage = async () => {
    const content = draft.trim();
    if (!content) return;

    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'CHAT_MESSAGE', chatId, content }));
      setDraft('');
      return;
    }

    // Fallback: send via REST when the socket is not available yet.
    setSending(true);
    try {
      const response = await api.post(`/api/chats/${chatId}/messages`, { content });
      const m = response.data?.data;
      if (m) {
        setMessages((prev) => [
          ...prev,
          {
            key: `rest-${m.id}`,
            senderId: Number(m.sender?.id),
            content: m.messageText ?? content,
            timestamp: m.sentAt,
          },
        ]);
      }
      setDraft('');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToEnd = () => {
    listRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <Screen edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : undefined}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <MessageBubble
                mine={Number(item.senderId) === Number(userId)}
                content={item.content}
                timestamp={item.timestamp}
              />
            )}
            contentContainerStyle={
              messages.length === 0 ? styles.emptyContent : styles.listContent
            }
            onContentSizeChange={scrollToEnd}
            onLayout={scrollToEnd}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <EmptyState title="No messages yet" subtitle="Say hello to start the conversation." />
            }
          />
        )}

        <View style={styles.composer}>
          <FormTextInput
            containerStyle={styles.composerInputWrapper}
            placeholder="Type a message…"
            value={draft}
            onChangeText={setDraft}
            multiline
            editable={!sending}
            style={styles.composerInput}
          />
          <TouchableOpacity
            style={[styles.sendButton, !draft.trim() ? styles.sendButtonDisabled : null]}
            onPress={sendMessage}
            disabled={!draft.trim() || sending}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator color={Colors.textOnPrimary} />
            ) : (
              <AppText style={styles.sendButtonText}>➤</AppText>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.md,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.card,
  },
  composerInputWrapper: {
    flex: 1,
    marginBottom: 0,
  },
  composerInput: {
    borderRadius: 24,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
    marginBottom: 3,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 18,
  },
});