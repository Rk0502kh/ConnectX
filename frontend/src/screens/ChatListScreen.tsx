import React, { useCallback, useContext, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import { Colors, Spacing } from '../theme';
import { formatDay } from '../utils/format';
import type { Chat, ChatParticipant } from '../types';

export default function ChatListScreen({ navigation }: any) {
  const { userId, signOut } = useContext(AuthContext);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadChats = useCallback(async () => {
    try {
      const response = await api.get('/api/chats');
      setChats(response.data?.data ?? []);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load chats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, [loadChats])
  );

  const handleLogout = useCallback(async () => {
    await signOut();
  }, [signOut]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Users')}
          >
            <Text style={styles.headerButtonText}>New Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
            <Text style={styles.headerButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, handleLogout]);

  const getOtherParticipant = (chat: Chat): ChatParticipant | null => {
    if (!chat.participants) return null;
    const current = Number(userId);
    const other = chat.participants.find((p) => Number(p.user?.id) !== current);
    return other ?? null;
  };

  const renderChat = ({ item }: { item: Chat }) => {
    const other = getOtherParticipant(item);
    const name = other?.user?.username ?? 'Chat';
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ChatRoom', { chatId: item.id, title: name })}
      >
        <Avatar name={name} online={other?.user?.onlineStatus} />
        <View style={styles.cardBody}>
          <AppText variant="heading" numberOfLines={1}>
            {name}
          </AppText>
          <AppText variant="caption" numberOfLines={1}>
            Tap to open the conversation
          </AppText>
        </View>
        <AppText variant="caption">{formatDay(item.updatedAt ?? item.createdAt)}</AppText>
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderChat}
          contentContainerStyle={chats.length === 0 ? styles.emptyContent : styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await loadChats();
              }}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No conversations yet"
              subtitle="Tap “New Chat” to start talking with someone."
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardBody: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: Spacing.md,
    paddingVertical: 4,
  },
  headerButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});