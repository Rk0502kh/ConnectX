import React, { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
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
import type { Chat, User } from '../types';

export default function UsersScreen({ navigation }: any) {
  const { userId } = useContext(AuthContext);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [startingChatId, setStartingChatId] = useState<number | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      const response = await api.get('/api/users');
      const all: User[] = Array.isArray(response.data) ? response.data : [];
      setUsers(all.filter((u) => Number(u.id) !== Number(userId)));
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers])
  );

  const findExistingChat = async (otherUserId: number): Promise<Chat | undefined> => {
    const response = await api.get('/api/chats');
    const chats: Chat[] = response.data?.data ?? [];
    return chats.find((c) =>
      c.participants?.some((p) => Number(p.user?.id) === Number(otherUserId))
    );
  };

  const startChat = async (other: User) => {
    setStartingChatId(other.id);
    try {
      const response = await api.post('/api/chats', { userId: other.id });
      const chatId = response.data?.data?.id;
      if (chatId) {
        navigation.navigate('ChatRoom', { chatId, title: other.username });
        return;
      }
      throw new Error('Chat could not be created');
    } catch (error: any) {
      const message = error.response?.data?.message ?? '';
      if (message === 'Chat already exists') {
        try {
          const existing = await findExistingChat(other.id);
          if (existing) {
            navigation.navigate('ChatRoom', { chatId: existing.id, title: other.username });
            return;
          }
          Alert.alert('Info', 'This conversation already exists. Open it from Messages.');
        } catch (err) {
          Alert.alert('Error', 'Could not open the existing conversation.');
        }
      } else {
        Alert.alert('Error', message || 'Could not start chat.');
      }
    } finally {
      setStartingChatId(null);
    }
  };

  const renderUser = ({ item }: { item: User }) => {
    const starting = startingChatId === item.id;
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => startChat(item)}
        disabled={startingChatId !== null}
      >
        <Avatar name={item.username} online={item.onlineStatus} />
        <View style={styles.cardBody}>
          <AppText variant="heading" numberOfLines={1}>
            {item.username}
          </AppText>
          <AppText variant="caption" numberOfLines={1}>
            {item.email}
          </AppText>
        </View>
        {starting ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <AppText variant="label" style={styles.startLabel}>
            Chat
          </AppText>
        )}
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
          data={users}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderUser}
          contentContainerStyle={users.length === 0 ? styles.emptyContent : styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await loadUsers();
              }}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState title="No other users found" subtitle="Invite friends to get started." />
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
  startLabel: {
    color: Colors.primary,
  },
});