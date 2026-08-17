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
  Modal,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthActions } from '@convex-dev/auth/react';
import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { makeRedirectUri } from 'expo-auth-session';
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react-native';

import { useAppTheme } from '@/context/theme-context';
import { Radius } from '@/constants/theme';
import { GoogleLogo } from '@/components/ui/GoogleLogo';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn } = useAuthActions();
  const theme = useAppTheme();
  const { colors } = theme;

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await signIn('password', { email, password, flow: 'signIn' });
      // Router will automatically redirect to (tabs) due to _layout guard
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (Platform.OS === 'web') {
        // On web, redirect the whole page to Google instead of using a popup, avoiding browser popup blockers
        await signIn('google');
        return;
      }

      const redirectTo = makeRedirectUri();
      const { redirect } = await signIn('google', { redirectTo });
      
      if (redirect) {
        const result = await WebBrowser.openAuthSessionAsync(redirect.toString(), redirectTo);
        if (result.type === 'success') {
          const parsedUrl = Linking.parse(result.url);
          const code = parsedUrl.queryParams?.code;
          if (typeof code === 'string') {
            await signIn('google', { code });
            // Router will automatically redirect to (tabs) due to _layout guard
          } else {
            setError('Google sign in did not return an authorization code.');
          }
        }
      } else {
        setError('Google sign in did not return a redirect URL.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google.');
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
          
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: colors.accentMuted }]}>
              <LogIn size={30} color={colors.accent} />
            </View>
            <Text style={[styles.brandName, { color: colors.accent }]}>LICENSIFY</Text>
            <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sign in to continue your ALE preparation.
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

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Password</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                <Lock size={18} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!isLoading}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={8}
                  style={styles.eyeBtn}>
                  {showPassword ? (
                    <EyeOff size={18} color={colors.textSecondary} />
                  ) : (
                    <Eye size={18} color={colors.textSecondary} />
                  )}
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.submitButton,
                {
                  backgroundColor: colors.accent,
                  opacity: pressed || isLoading ? 0.7 : 1,
                },
              ]}>
              <Text style={styles.submitButtonText}>Sign In</Text>
            </Pressable>

            <Pressable
              onPress={handleGoogleLogin}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.googleButton,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.border,
                  opacity: pressed || isLoading ? 0.7 : 1,
                },
              ]}>
              <GoogleLogo size={18} />
              <Text style={[styles.googleButtonText, { color: colors.text }]}>
                Sign In with Google
              </Text>
            </Pressable>

            <Link href={"/forgot-password" as any} asChild>
              <Pressable style={{ alignItems: 'center', marginTop: 8 }}>
                <Text style={{ color: colors.accent, fontSize: 14, fontWeight: '600' }}>Forgot Password?</Text>
              </Pressable>
            </Link>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Don{"'"}t have an account?{' '}
            </Text>
            <Link href={"/(auth)/register" as any} asChild>
              <Pressable>
                <Text style={[styles.linkText, { color: colors.accent }]}>Sign Up</Text>
              </Pressable>
            </Link>
          </View>

        </View>
      </KeyboardAvoidingView>

      {/* Signing In Animated Loading Modal */}
      <Modal
        visible={isLoading}
        transparent
        animationType="fade"
        statusBarTranslucent>
        <View style={styles.signingInBackdrop}>
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={[
              styles.signingInCard,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}>
            <View
              style={[
                styles.signingInIconCircle,
                { backgroundColor: colors.accentMuted },
              ]}>
              <LogIn size={26} color={colors.accent} strokeWidth={2.2} />
            </View>

            <View style={styles.signingInTextCol}>
              <Text style={[styles.signingInTitle, { color: colors.text }]}>
                Signing In...
              </Text>
              <Text style={[styles.signingInSubtitle, { color: colors.textSecondary }]}>
                Authenticating account and preparing study hub
              </Text>
            </View>

            <ActivityIndicator size="small" color={colors.accent} style={{ marginTop: 2 }} />
          </Animated.View>
        </View>
      </Modal>
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
  content: {
    flex: 1,
    padding: 24,
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
    marginBottom: 16,
  },
  brandName: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.5,
    marginBottom: 4,
    textTransform: 'uppercase',
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
  googleButton: {
    height: 52,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    gap: 10,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  eyeBtn: {
    padding: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
  },

  /* Signing In Animated Modal */
  signingInBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  signingInCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 14,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  signingInIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signingInTextCol: {
    alignItems: 'center',
    gap: 4,
  },
  signingInTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  signingInSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});
