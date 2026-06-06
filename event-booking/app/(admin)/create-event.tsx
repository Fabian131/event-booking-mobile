import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';

import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedView } from '@/src/components/ui/themed-view';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { ApiError } from '@/src/types/auth';
import { validateCreateEventForm, type CreateEventFormValues } from '@/src/utils/validators';
import type { FieldError } from '@/src/types/auth';
import { eventService } from '@/src/services/eventService';

export default function CreateEventScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [category, setCategory] = useState('');
  
  const [date, setDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

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

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    clearErrors();

    const values: CreateEventFormValues = {
      title,
      description,
      max_capacity: maxCapacity,
      category,
      date,
      start_time: startTime,
      end_time: endTime,
      image: imageUri,
    };

    const clientErrors = validateCreateEventForm(values);
    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      if (description) formData.append('description', description.trim());
      formData.append('max_capacity', maxCapacity.trim());
      formData.append('category', category.trim().toLowerCase());
      
      if (date) {
        const d = date.toISOString().split('T')[0];
        formData.append('date', d);
      }
      
      if (startTime) {
        const s = startTime.toTimeString().split(' ')[0];
        formData.append('start_time', s);
      }
      
      if (endTime) {
        const e = endTime.toTimeString().split(' ')[0];
        formData.append('end_time', e);
      }

      if (imageUri) {
        const filename = imageUri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('image', {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }

      await eventService.createEvent(formData);

      router.back();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details && err.details.length > 0) {
          setErrors(err.details);
          
          const scheduleError = err.details.find(d => d.field === 'schedule');
          if (scheduleError) {
            setServerError('Ya existe un evento programado en esta fecha y horario. Por favor selecciona otro.');
            return;
          }
        }
        setServerError(err.message);
      } else if (err instanceof TypeError) {
        setServerError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      } else {
        setServerError('Ocurrió un error inesperado. Intenta nuevamente.');
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
            <ThemedText type="title">Crear Evento</ThemedText>
            <ThemedText>Ingresa los detalles del nuevo evento</ThemedText>
          </ThemedView>

          {serverError ? (
            <View style={styles.serverError}>
              <ThemedText style={styles.serverErrorText}>{serverError}</ThemedText>
            </View>
          ) : null}

          <ThemedView style={styles.form}>
            <Input
              label="Título"
              placeholder="Nombre del evento"
              value={title}
              onChangeText={setTitle}
              error={getFieldError('title')}
              editable={!loading}
            />

            <Input
              label="Descripción"
              placeholder="Breve descripción del evento"
              value={description}
              onChangeText={setDescription}
              error={getFieldError('description')}
              editable={!loading}
            />

            <Input
              label="Capacidad Máxima"
              placeholder="Ej. 100"
              value={maxCapacity}
              onChangeText={setMaxCapacity}
              error={getFieldError('max_capacity')}
              editable={!loading}
              keyboardType="numeric"
            />

            <View style={styles.pickerContainer}>
              <ThemedText style={styles.label}>Categoría</ThemedText>
              <View style={[styles.pickerWrapper, getFieldError('category') ? styles.inputError : null]}>
                <Picker
                  selectedValue={category}
                  onValueChange={(itemValue) => setCategory(itemValue)}
                  enabled={!loading}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecciona una categoría" value="" />
                  <Picker.Item label="Deportes" value="sports" />
                  <Picker.Item label="Música" value="music" />
                  <Picker.Item label="Cultura" value="culture" />
                  <Picker.Item label="Gastronomía" value="gastronomy" />
                  <Picker.Item label="Bienestar" value="wellness" />
                  <Picker.Item label="Educación" value="education" />
                  <Picker.Item label="Otro" value="other" />
                </Picker>
              </View>
              {getFieldError('category') ? <ThemedText style={styles.errorText}>{getFieldError('category')}</ThemedText> : null}
            </View>

            <View style={styles.datePickerContainer}>
              <ThemedText style={styles.label}>Fecha</ThemedText>
              <TouchableOpacity onPress={() => !loading && setShowDatePicker(true)} style={[styles.pickerButton, getFieldError('date') ? styles.inputError : null]}>
                <ThemedText style={date ? undefined : styles.placeholderText}>
                  {date ? date.toISOString().split('T')[0] : 'Selecciona una fecha'}
                </ThemedText>
              </TouchableOpacity>
              {getFieldError('date') ? <ThemedText style={styles.errorText}>{getFieldError('date')}</ThemedText> : null}
              {showDatePicker && (
                <DateTimePicker
                  value={date || new Date()}
                  minimumDate={new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setDate(selectedDate);
                  }}
                />
              )}
            </View>

            <View style={styles.datePickerContainer}>
              <ThemedText style={styles.label}>Hora de Inicio</ThemedText>
              <TouchableOpacity onPress={() => !loading && setShowStartTimePicker(true)} style={[styles.pickerButton, getFieldError('start_time') ? styles.inputError : null]}>
                <ThemedText style={startTime ? undefined : styles.placeholderText}>
                  {startTime ? startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Selecciona hora de inicio'}
                </ThemedText>
              </TouchableOpacity>
              {getFieldError('start_time') ? <ThemedText style={styles.errorText}>{getFieldError('start_time')}</ThemedText> : null}
              {showStartTimePicker && (
                <DateTimePicker
                  value={startTime || new Date()}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowStartTimePicker(false);
                    if (selectedDate) setStartTime(selectedDate);
                  }}
                />
              )}
            </View>

            <View style={styles.datePickerContainer}>
              <ThemedText style={styles.label}>Hora de Fin</ThemedText>
              <TouchableOpacity onPress={() => !loading && setShowEndTimePicker(true)} style={[styles.pickerButton, getFieldError('end_time') ? styles.inputError : null]}>
                <ThemedText style={endTime ? undefined : styles.placeholderText}>
                  {endTime ? endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Selecciona hora de fin'}
                </ThemedText>
              </TouchableOpacity>
              {getFieldError('end_time') ? <ThemedText style={styles.errorText}>{getFieldError('end_time')}</ThemedText> : null}
              {showEndTimePicker && (
                <DateTimePicker
                  value={endTime || new Date()}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowEndTimePicker(false);
                    if (selectedDate) setEndTime(selectedDate);
                  }}
                />
              )}
            </View>

            <View style={styles.imagePickerContainer}>
              <ThemedText style={styles.label}>Imagen (Opcional, max 5MB)</ThemedText>
              <TouchableOpacity onPress={pickImage} style={styles.imageButton} disabled={loading}>
                <ThemedText>{imageUri ? 'Cambiar Imagen' : 'Seleccionar Imagen'}</ThemedText>
              </TouchableOpacity>
              {imageUri && (
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
              )}
            </View>

            <Button
              title="Crear Evento"
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            />
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
    padding: 24,
    paddingBottom: 48,
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
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  pickerContainer: {
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  datePickerContainer: {
    marginBottom: 8,
  },
  pickerButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  placeholderText: {
    color: '#999',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
  inputError: {
    borderColor: '#dc3545',
  },
  imagePickerContainer: {
    marginBottom: 16,
  },
  imageButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
});
