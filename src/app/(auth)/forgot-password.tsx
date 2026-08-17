import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthActions } from '@convex-dev/auth/react';
import { router } from 'expo-router';
import { Mail, Lock, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react-native';

import { useAppTheme } from '@/context/theme-context';
import { Radius } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { signIn } = useAuthActions();
  const theme = useAppTheme();
  const { colors } = theme;

  const handleSendCode = async () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Step 1: Request reset code
      await signIn('password', { email, flow: 'reset' });
      setStep(2);
      setSuccessMsg('If an account exists, a reset code was sent.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!code || !newPassword) {
      setError('Please enter the code and a new password.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Step 2: Verify code and set new password
      await signIn('password', { email, code, newPassword, flow: 'reset-verification' });
      // On success, we are logged in, redirect home
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Check your code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <View style={styles.content}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </Pressable>

          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: colors.accentMuted }]}>
              <KeyRound size={32} color={colors.accent} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              {step === 1 ? 'Reset Password' : 'Enter Code'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {step === 1
                ? 'Enter your email and we will send you a reset code.'
                : 'Enter the code from your email and your new password.'}
            </Text>
          </View>

          {error && (
            <View style={[styles.alertBox, { backgroundColor: 'rgba(239, 68, 68, 0.12)', borderColor: '#EF4444' }]}>
              <AlertCircle size={16} color="#EF4444" />
              <Text style={[styles.alertText, { color: '#EF4444' }]}>{error}</Text>
            </View>
          )}

          {successMsg && (
            <View style={[styles.alertBox, { backgroundColor: 'rgba(34, 197, 94, 0.12)', borderColor: '#22C55E' }]}>
              <Text style={[styles.alertText, { color: '#22C55E' }]}>{successMsg}</Text>
            </View>
          )}

          {step === 1 ? (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                  <Mail size={18} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    editable={!isLoading}
                  />
                </View>
              </View>

              <Pressable
                onPress={handleSendCode}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.submitButton,
                  {
                    backgroundColor: colors.accent,
                    opacity: pressed || isLoading ? 0.7 : 1,
                  },
                ]}>
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Send Code</Text>
                )}
              </Pressable>
            </View>
          ) : (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Reset Code</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                  <KeyRound size={18} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="6-digit code"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="number-pad"
                    value={code}
                    onChangeText={setCode}
                    editable={!isLoading}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                  <Lock size={18} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="New password (min 8 chars)"
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                    editable={!isLoading}
                  />
                </View>
              </View>

              <Pressable
                onPress={handleResetPassword}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.submitButton,
                  {
                    backgroundColor: colors.accent,
                    opacity: pressed || isLoading ? 0.7 : 1,
                  },
                ]}>
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Reset Password & Sign In</Text>
                )}
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 24, left: 24, zIndex: 10 },
  header: { alignItems: 'center', marginBottom: 40 },
  iconContainer: { width: 64, height: 64, borderRadius: 9999, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, textAlign: 'center', paddingHorizontal: 20, lineHeight: 22 },
  alertBox: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: Radius.sm, borderWidth: 1, marginBottom: 20, gap: 8 },
  alertText: { fontSize: 13, fontWeight: '500', flex: 1 },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: 16, height: 52 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, height: '100%' },
  submitButton: { height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  submitButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
