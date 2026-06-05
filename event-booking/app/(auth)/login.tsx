import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedView } from '@/src/components/ui/themed-view';

export default function LoginScreen() {
  const { registered } = useLocalSearchParams<{ registered?: string }>();
  const [showSuccess, setShowSuccess] = useState(registered === 'true');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (registered !== 'true') return;

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
  }, [registered, fadeAnim]);

  const [_email, _setEmail] = useState('');
  const [_password, _setPassword] = useState('');

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Iniciar Sesión</ThemedText>
        <ThemedText>Accede a tu cuenta de Event Booking</ThemedText>
      </ThemedView>

      {showSuccess && (
        <Animated.View style={[styles.successBanner, { opacity: fadeAnim }]}>
          <ThemedText style={styles.successText}>
            Cuenta creada exitosamente. Ahora puedes iniciar sesión.
          </ThemedText>
        </Animated.View>
      )}

      <ThemedView style={styles.form}>
        <View style={styles.inputContainer}>
          <ThemedText type="defaultSemiBold">Correo electrónico</ThemedText>
          <View style={styles.input}>
            <ThemedText>{_email || 'Ingresa tu correo'}</ThemedText>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <ThemedText type="defaultSemiBold">Contraseña</ThemedText>
          <View style={styles.input}>
            <ThemedText>{_password ? '••••••••' : 'Ingresa tu contraseña'}</ThemedText>
          </View>
        </View>

        <TouchableOpacity style={styles.button}>
          <ThemedText type="defaultSemiBold" style={styles.buttonText}>
            Ingresar
          </ThemedText>
        </TouchableOpacity>

        <View style={styles.footer}>
          <ThemedText>¿No tienes cuenta? </ThemedText>
          <Link href="/(auth)/register">
            <ThemedText type="link">Regístrate</ThemedText>
          </Link>
        </View>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
  },
  button: {
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
});
