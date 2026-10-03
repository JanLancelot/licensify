import { formatAuthError } from '@/utils/errorUtils';
import { useAuthActions } from '@convex-dev/auth/react';
import { makeRedirectUri } from 'expo-auth-session';
import * as Linking from 'expo-linking';
import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { AlertCircle, Eye, EyeOff, Lock, LogIn, Mail } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand/BrandMark';
import { GoogleLogo } from '@/components/ui/GoogleLogo';
import { Radius } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn } = useAuthActions();
  const theme = useAppTheme();
  const { colors, isDark } = theme;

  const brandYellow = '#E3D200';
  const brandOlive = '#393500';
  const brandAccent = isDark ? '#E3D200' : '#797100';

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
      setError(formatAuthError(err));
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
      setError(formatAuthError(err));
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
            <BrandMark size={88} style={{ marginBottom: 16 }} />
            <Text style={[styles.brandName, { color: brandAccent }]}>P App</Text>
            <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sign in to continue where you left off.
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
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.backgroundElement,
                    borderColor: focusedField === 'email' ? brandAccent : colors.border,
                    borderWidth: focusedField === 'email' ? 1.5 : 1,
                  },
                ]}>
                <Mail
                  size={18}
                  color={focusedField === 'email' ? brandAccent : colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.backgroundElement,
                    borderColor: focusedField === 'password' ? brandAccent : colors.border,
                    borderWidth: focusedField === 'password' ? 1.5 : 1,
                  },
                ]}>
                <Lock
                  size={18}
                  color={focusedField === 'password' ? brandAccent : colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  editable={!isLoading}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={8}
                  style={styles.eyeBtn}>
                  {showPassword ? (
                    <EyeOff size={18} color={focusedField === 'password' ? brandAccent : colors.textSecondary} />
                  ) : (
                    <Eye size={18} color={focusedField === 'password' ? brandAccent : colors.textSecondary} />
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
                  backgroundColor: brandYellow,
                  opacity: pressed || isLoading ? 0.75 : 1,
                },
              ]}>
              <Text style={[styles.submitButtonText, { color: brandOlive }]}>Sign In</Text>
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
                <Text style={{ color: brandAccent, fontSize: 14, fontWeight: '600' }}>Forgot Password?</Text>
              </Pressable>
            </Link>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Don{"'"}t have an account?{' '}
            </Text>
            <Link href={"/(auth)/register" as any} asChild>
              <Pressable hitSlop={8}>
                <Text style={[styles.linkText, { color: brandAccent }]}>Sign Up</Text>
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
                { backgroundColor: isDark ? 'rgba(227, 210, 0, 0.15)' : 'rgba(227, 210, 0, 0.25)' },
              ]}>
              <LogIn size={26} color={brandAccent} strokeWidth={2.2} />
            </View>

            <View style={styles.signingInTextCol}>
              <Text style={[styles.signingInTitle, { color: colors.text }]}>
                Signing In...
              </Text>
              <Text style={[styles.signingInSubtitle, { color: colors.textSecondary }]}>
                Authenticating account and preparing study hub
              </Text>
            </View>

            <ActivityIndicator size="small" color={brandAccent} style={{ marginTop: 2 }} />
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
