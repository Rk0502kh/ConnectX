import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../services/api';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import PrimaryButton from '../components/PrimaryButton';
import FormTextInput from '../components/FormTextInput';
import { Colors, Spacing } from '../theme';

export default function RegisterScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError(null);
    if (!username.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/api/auth/register', {
        username: username.trim(),
        email: email.trim(),
        password,
        contactNumber: contactNumber.trim() || undefined,
      });
      if (response.data && response.data.success) {
        Alert.alert('Account created', 'You can now sign in with your new account.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
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
            <AppText variant="title">Create account</AppText>
            <AppText variant="caption" style={styles.subtitle}>
              Join ConnectX and start chatting
            </AppText>
          </View>

          <FormTextInput
            label="Username"
            placeholder="How others see you"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
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
            label="Contact number (optional)"
            placeholder="+1 555 000 1234"
            value={contactNumber}
            onChangeText={setContactNumber}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
          />
          <FormTextInput
            label="Password"
            placeholder="At least 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="newPassword"
          />
          <FormTextInput
            label="Confirm password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            textContentType="newPassword"
          />

          {error ? (
            <AppText variant="caption" style={styles.error}>
              {error}
            </AppText>
          ) : null}

          <PrimaryButton title="Create Account" onPress={handleRegister} loading={loading} />

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.linkButton}
          >
            <AppText variant="body" style={styles.linkText}>
              Already have an account? <AppText variant="body" style={styles.linkAccent}>Log in</AppText>
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
    marginBottom: Spacing.lg,
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