import { useEffect, useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedView } from '@/src/components/ui/themed-view';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/context/AuthContext';
import { ApiError, type FieldError } from '@/src/types/auth';
import { validateLoginForm, type LoginFormValues } from '@/src/utils/validators';
import { AUTH, ERRORS } from '@/src/constants/ui';

export default function LoginScreen() {
  const { login } = useAuth();
  const { registered, loggedOut } = useLocalSearchParams<{ registered?: string; loggedOut?: string }>();
  const [showSuccess, setShowSuccess] = useState(registered === 'true' || loggedOut === 'true');
  const successMessage =
    loggedOut === 'true'
      ? 'Sesión cerrada correctamente.'
      : AUTH.REGISTERED_SUCCESS;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (registered !== 'true' && loggedOut !== 'true') return;

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setShowSuccess(false);
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [registered, loggedOut, fadeAnim]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  function getFieldError(field: string): string | undefined {
    return errors.find((error) => error.field === field)?.message;
  }

  function clearErrors() {
    setErrors([]);
    setServerError('');
  }

  async function handleLogin() {
    clearErrors();

    const values: LoginFormValues = {
      email,
      password,
    };

    const clientErrors = validateLoginForm(values);
    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      return;
    }

    setLoading(true);

    try {
      const authenticatedUser = await login({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authenticatedUser.role === 'business') {
        router.replace('/(admin)');
      } else {
        router.replace('/(customer)/events');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (Array.isArray(err.details) && err.details.length > 0) {
          setErrors(err.details);
        }

        if (err.status === 401) {
          setServerError(ERRORS.INVALID_CREDENTIALS);
        } else if (err.status === 422) {
          setServerError(ERRORS.VALIDATION_BANNER);
        } else {
          setServerError(ERRORS.GENERIC);
        }
      } else if (err instanceof TypeError) {
        setServerError(ERRORS.NETWORK);
      } else {
        setServerError(ERRORS.GENERIC);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedView style={styles.header}>
            <ThemedText type="title">{AUTH.LOGIN_TITLE}</ThemedText>
            <ThemedText>{AUTH.LOGIN_SUBTITLE}</ThemedText>
          </ThemedView>

          {showSuccess && (
            <Animated.View style={[styles.successBanner, { opacity: fadeAnim }]}>
              <ThemedText style={styles.successText}>
                {successMessage}
              </ThemedText>
            </Animated.View>
          )}

          {serverError ? (
            <View style={styles.serverError}>
              <ThemedText style={styles.serverErrorText}>{serverError}</ThemedText>
            </View>
          ) : null}

          <ThemedView style={styles.form}>
            <Input
              label={AUTH.LOGIN_EMAIL_LABEL}
              placeholder={AUTH.LOGIN_EMAIL_PLACEHOLDER}
              value={email}
              onChangeText={setEmail}
              error={getFieldError('email')}
              editable={!loading}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label={AUTH.LOGIN_PASSWORD_LABEL}
              placeholder={AUTH.LOGIN_PASSWORD_PLACEHOLDER}
              value={password}
              onChangeText={setPassword}
              error={getFieldError('password')}
              editable={!loading}
              secureTextEntry
            />

            <Button
              title={AUTH.LOGIN_BUTTON}
              onPress={handleLogin}
              loading={loading}
              style={styles.submitButton}
            />

            <View style={styles.footer}>
              <ThemedText>{AUTH.LOGIN_NO_ACCOUNT} </ThemedText>
              <Link href="/(auth)/register" accessibilityRole="link">
                <ThemedText type="link">{AUTH.LOGIN_REGISTER_LINK}</ThemedText>
              </Link>
            </View>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    gap: 8,
    marginBottom: 32,
    alignItems: 'center',
  },
  successBanner: {
    backgroundColor: '#d4edda',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#28a745',
  },
  successText: {
    color: '#155724',
    textAlign: 'center',
  },
  serverError: {
    backgroundColor: '#fdecea',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  serverErrorText: {
    color: '#dc3545',
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  submitButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
});
