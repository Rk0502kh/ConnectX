import React, { useContext, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import PrimaryButton from '../components/PrimaryButton';
import FormTextInput from '../components/FormTextInput';
import { Colors, Spacing } from '../theme';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email: email.trim(), password });
      if (response.data && response.data.success) {
        const token = response.data.data.token;
        // The API login returns a token; fetch the user profile to get the user id.
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const meResponse = await api.get('/api/auth/me');
        if (meResponse.data && meResponse.data.success) {
          await signIn(token, meResponse.data.data.id);
          return;
        }
        throw new Error('Failed to retrieve user profile');
      }
      throw new Error(response.data.message || 'Login failed');
    } catch (err: any) {
      console.error(err);
      const message =
        err && err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : err && err.message
          ? err.message
          : 'Network error. Please try again.';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <AppText variant="title">ConnectX</AppText>
            <AppText variant="caption" style={styles.subtitle}>
              Sign in to start chatting
            </AppText>
          </View>

          <FormTextInput
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <FormTextInput
            label="Password"
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
          />

          {error ? (
            <AppText variant="caption" style={styles.error}>
              {error}
            </AppText>
          ) : null}

          <PrimaryButton title="Log In" onPress={handleLogin} loading={loading} />

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.linkButton}
          >
            <AppText variant="body" style={styles.linkText}>
              Don't have an account? <AppText variant="body" style={styles.linkAccent}>Register</AppText>
            </AppText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  error: {
    color: Colors.error,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  linkButton: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  linkText: {
    color: Colors.textSecondary,
  },
  linkAccent: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
