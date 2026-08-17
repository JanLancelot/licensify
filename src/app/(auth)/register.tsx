import { useAuthActions } from '@convex-dev/auth/react';
import { Link, router } from 'expo-router';
import { AlertCircle, Lock, Mail, User, UserPlus, KeyRound } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Radius } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn } = useAuthActions();
  const theme = useAppTheme();
  const { colors } = theme;

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await signIn('password', {
        email,
        password,
        firstName,
        lastName,
        flow: 'signUp',
      });
      // Move to verification step
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code) {
      setError('Please enter the verification code.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await signIn('password', { email, code, flow: 'email-verification' });
      // Router will automatically redirect to (tabs) due to auth state change, or we can force it:
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Invalid verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: colors.accentMuted }]}>
              {step === 1 ? <UserPlus size={32} color={colors.accent} /> : <KeyRound size={32} color={colors.accent} />}
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              {step === 1 ? 'Create Account' : 'Verify Email'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {step === 1 
                ? 'Join Licensify to track your ALE progress.' 
                : 'Enter the 6-digit code sent to your email.'}
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View style={[styles.errorBox, { backgroundColor: 'rgba(239, 68, 68, 0.12)', borderColor: '#EF4444' }]}>
              <AlertCircle size={16} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Form */}
          {step === 1 ? (
            <View style={styles.form}>
              <View style={styles.nameRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.text }]}>First Name</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                    <User size={18} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Jane"
                      placeholderTextColor={colors.textSecondary}
                      value={firstName}
                      onChangeText={setFirstName}
                      editable={!isLoading}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.text }]}>Last Name</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                    <TextInput
                      style={[styles.input, { color: colors.text, paddingLeft: 12 }]}
                      placeholder="Doe"
                      placeholderTextColor={colors.textSecondary}
                      value={lastName}
                      onChangeText={setLastName}
                      editable={!isLoading}
                    />
                  </View>
                </View>
              </View>

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

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Password</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                  <Lock size={18} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Create a password"
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    editable={!isLoading}
                  />
                </View>
              </View>

              <Pressable
                onPress={handleRegister}
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
                  <Text style={styles.submitButtonText}>Sign Up</Text>
                )}
              </Pressable>
            </View>
          ) : (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Verification Code</Text>
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

              <Pressable
                onPress={handleVerify}
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
                  <Text style={styles.submitButtonText}>Verify & Complete Setup</Text>
                )}
              </Pressable>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text style={[styles.linkText, { color: colors.accent }]}>Sign In</Text>
              </Pressable>
            </Link>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: Radius.sm,
    borderWidth: 1,
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  form: {
    gap: 20,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  submitButton: {
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
