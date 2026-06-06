import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Link, router } from 'expo-router';

import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedView } from '@/src/components/ui/themed-view';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/context/AuthContext';
import { ApiError } from '@/src/types/auth';
import {
  validateRegistrationForm,
  type RegisterFormValues,
} from '@/src/utils/validators';
import type { FieldError } from '@/src/types/auth';
import { AUTH, ERRORS } from '@/src/constants/ui';

export default function RegisterScreen() {
  const { register } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<FieldError[]>([]);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  function getFieldError(field: string): string | undefined {
    return errors.find((e) => e.field === field)?.message;
  }

  function clearErrors() {
    setErrors([]);
    setServerError('');
  }

  async function handleRegister() {
    clearErrors();

    const values: RegisterFormValues = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      password,
      confirmPassword,
    };

    const clientErrors = validateRegistrationForm(values);
    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      return;
    }

    setLoading(true);

    try {
      await register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        password,
      });

      router.replace('/(auth)/login?registered=true');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details && err.details.length > 0) {
          setErrors(err.details);
        }
        setServerError(err.message);
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
            <ThemedText type="title">{AUTH.REGISTER_TITLE}</ThemedText>
            <ThemedText>{AUTH.REGISTER_SUBTITLE}</ThemedText>
          </ThemedView>

          {serverError ? (
            <View style={styles.serverError}>
              <ThemedText style={styles.serverErrorText}>{serverError}</ThemedText>
            </View>
          ) : null}

          <ThemedView style={styles.form}>
            <Input
              label={AUTH.REGISTER_FIRST_NAME_LABEL}
              placeholder={AUTH.REGISTER_FIRST_NAME_PLACEHOLDER}
              value={firstName}
              onChangeText={setFirstName}
              error={getFieldError('first_name')}
              editable={!loading}
            />

            <Input
              label={AUTH.REGISTER_LAST_NAME_LABEL}
              placeholder={AUTH.REGISTER_LAST_NAME_PLACEHOLDER}
              value={lastName}
              onChangeText={setLastName}
              error={getFieldError('last_name')}
              editable={!loading}
            />

            <Input
              label={AUTH.REGISTER_EMAIL_LABEL}
              placeholder={AUTH.REGISTER_EMAIL_PLACEHOLDER}
              value={email}
              onChangeText={setEmail}
              error={getFieldError('email')}
              editable={!loading}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label={AUTH.REGISTER_PHONE_LABEL}
              placeholder={AUTH.REGISTER_PHONE_PLACEHOLDER}
              value={phone}
              onChangeText={setPhone}
              error={getFieldError('phone')}
              editable={!loading}
              keyboardType="phone-pad"
            />

            <Input
              label={AUTH.REGISTER_PASSWORD_LABEL}
              placeholder={AUTH.REGISTER_PASSWORD_PLACEHOLDER}
              value={password}
              onChangeText={setPassword}
              error={getFieldError('password')}
              editable={!loading}
              secureTextEntry
            />

            <Input
              label={AUTH.REGISTER_CONFIRM_PASSWORD_LABEL}
              placeholder={AUTH.REGISTER_CONFIRM_PASSWORD_PLACEHOLDER}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={getFieldError('confirmPassword')}
              editable={!loading}
              secureTextEntry
            />

            <Button
              title={AUTH.REGISTER_BUTTON}
              onPress={handleRegister}
              loading={loading}
              style={styles.submitButton}
            />

            <View style={styles.footer}>
              <ThemedText>{AUTH.REGISTER_HAS_ACCOUNT} </ThemedText>
              <Link href="/(auth)/login" accessibilityRole="link">
                <ThemedText type="link">{AUTH.REGISTER_LOGIN_LINK}</ThemedText>
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
