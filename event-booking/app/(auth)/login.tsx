import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';

import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedView } from '@/src/components/ui/themed-view';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Iniciar Sesión</ThemedText>
        <ThemedText>Accede a tu cuenta de Event Booking</ThemedText>
      </ThemedView>

      <ThemedView style={styles.form}>
        <View style={styles.inputContainer}>
          <ThemedText type="defaultSemiBold">Correo electrónico</ThemedText>
          <View style={styles.input}>
            <ThemedText>{email || 'Ingresa tu correo'}</ThemedText>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <ThemedText type="defaultSemiBold">Contraseña</ThemedText>
          <View style={styles.input}>
            <ThemedText>{password ? '••••••••' : 'Ingresa tu contraseña'}</ThemedText>
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
