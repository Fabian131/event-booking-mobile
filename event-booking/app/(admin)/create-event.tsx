import { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, View, TouchableOpacity, Image, FlatList,
} from 'react-native';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedView } from '@/src/components/ui/themed-view';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { JSDatePicker } from '@/src/components/ui/JSDatePicker';
import { JSTimePicker } from '@/src/components/ui/JSTimePicker';
import { BottomModal } from '@/src/components/ui/BottomModal';
import { ApiError } from '@/src/types/auth';
import { validateCreateEventForm, type CreateEventFormValues } from '@/src/utils/validators';
import type { FieldError } from '@/src/types/auth';
import { eventsService } from '@/src/services/events';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const CATEGORIES = [
  { label: 'Deportes', value: 'sports' },
  { label: 'Música', value: 'music' },
  { label: 'Cultura', value: 'culture' },
  { label: 'Gastronomía', value: 'gastronomy' },
  { label: 'Bienestar', value: 'wellness' },
  { label: 'Educación', value: 'education' },
  { label: 'Otro', value: 'other' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmtDate(d: Date) { return d.toISOString().split('T')[0]; }
function fmtTime(d: Date) { return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export default function CreateEventScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Android native pickers
  const [showAndroidDate, setShowAndroidDate] = useState(false);
  const [showAndroidStart, setShowAndroidStart] = useState(false);
  const [showAndroidEnd, setShowAndroidEnd] = useState(false);

  // iOS/cross-platform modals
  const [catModal, setCatModal] = useState(false);
  const [dateModal, setDateModal] = useState(false);
  const [startModal, setStartModal] = useState(false);
  const [endModal, setEndModal] = useState(false);

  // Temp values for modal editing
  const [tmpDate, setTmpDate] = useState(new Date());
  const [tmpStart, setTmpStart] = useState(new Date());
  const [tmpEnd, setTmpEnd] = useState(new Date());

  const [errors, setErrors] = useState<FieldError[]>([]);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const err = (f: string) => errors.find(e => e.field === f)?.message;
  const catLabel = CATEGORIES.find(c => c.value === category)?.label ?? 'Selecciona una categoría';

  function openDate() {
    if (loading) return;
    if (Platform.OS === 'android') { setShowAndroidDate(true); }
    else { setTmpDate(date ?? new Date()); setDateModal(true); }
  }
  function openStart() {
    if (loading) return;
    if (Platform.OS === 'android') { setShowAndroidStart(true); }
    else { setTmpStart(startTime ?? new Date()); setStartModal(true); }
  }
  function openEnd() {
    if (loading) return;
    if (Platform.OS === 'android') { setShowAndroidEnd(true); }
    else { setTmpEnd(endTime ?? new Date()); setEndModal(true); }
  }

  async function pickImage() {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 });
    if (!r.canceled) {
      const asset = r.assets[0];
      const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
      const assetType = asset.mimeType ?? '';
      if (assetType && !validTypes.includes(assetType)) {
        setServerError('La imagen debe estar en formato PNG, JPG o WebP.');
        return;
      }
      setImageUri(asset.uri);
    }
  }

  async function handleSubmit() {
    setErrors([]); setServerError(''); setSuccess(false);
    const vals: CreateEventFormValues = { title, description, max_capacity: maxCapacity, category, date, start_time: startTime, end_time: endTime, image: imageUri };
    const clientErrors = validateCreateEventForm(vals);
    if (clientErrors.length > 0) { setErrors(clientErrors); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', title.trim());
      if (description) fd.append('description', description.trim());
      fd.append('max_capacity', maxCapacity.trim());
      fd.append('category', category.toLowerCase());
      if (date) fd.append('date', fmtDate(date));
      if (startTime) fd.append('start_time', startTime.toTimeString().split(' ')[0]);
      if (endTime) fd.append('end_time', endTime.toTimeString().split(' ')[0]);
      if (imageUri) {
        const fn = imageUri.split('/').pop() ?? 'image.jpg';
        const m = /\.(\w+)$/.exec(fn);
        const file = {
          uri: imageUri,
          name: fn,
          type: m ? `image/${m[1]}` : 'application/octet-stream',
        };
        fd.append('image', file as unknown as Blob);
      }
      await eventsService.create(fd);
      setServerError('');
      setSuccess(true);
      setTimeout(() => router.back(), 1200);
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.details?.length) {
          setErrors(e.details);
          if (e.details.find(d => d.field === 'schedule')) {
            setServerError('Ya existe un evento programado en esta fecha y horario. Por favor selecciona otro.');
            return;
          }
        }
        setServerError(e.message);
      } else if (e instanceof TypeError) {
        setServerError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      } else {
        setServerError('Ocurrió un error inesperado. Intenta nuevamente.');
      }
    } finally { setLoading(false); }
  }

  return (
    <ThemedView style={st.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={st.kav}>
        <ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled">

          <ThemedView style={st.header}>
            <ThemedText type="title">Crear Evento</ThemedText>
            <ThemedText>Ingresa los detalles del nuevo evento</ThemedText>
          </ThemedView>

          {success ? (
            <View style={st.successBanner}>
              <ThemedText style={st.successBannerTxt}>Evento creado exitosamente.</ThemedText>
            </View>
          ) : null}

          {serverError ? (
            <View style={st.errBanner}>
              <ThemedText style={st.errBannerTxt}>{serverError}</ThemedText>
            </View>
          ) : null}

          <ThemedView style={st.form}>
            <Input label="Título" placeholder="Nombre del evento" value={title} onChangeText={setTitle} error={err('title')} editable={!loading} />
            <Input label="Descripción" placeholder="Breve descripción del evento" value={description} onChangeText={setDescription} error={err('description')} editable={!loading} />
            <Input label="Capacidad máxima" placeholder="Ej. 100" value={maxCapacity} onChangeText={setMaxCapacity} error={err('max_capacity')} editable={!loading} keyboardType="numeric" />

            {/* Category */}
            <View style={st.field}>
              <ThemedText type="defaultSemiBold" style={st.label}>Categoría</ThemedText>
              <TouchableOpacity onPress={() => !loading && setCatModal(true)} style={[st.selector, err('category') && st.selectorErr]} accessibilityLabel="Seleccionar categoría" accessibilityRole="button">
                <ThemedText style={category ? undefined : st.ph}>{catLabel}</ThemedText>
              </TouchableOpacity>
              {err('category') && <ThemedText style={st.fieldErr}>{err('category')}</ThemedText>}
            </View>

            {/* Date */}
            <View style={st.field}>
              <ThemedText type="defaultSemiBold" style={st.label}>Fecha</ThemedText>
              <TouchableOpacity onPress={openDate} style={[st.selector, err('date') && st.selectorErr]} accessibilityLabel="Seleccionar fecha" accessibilityRole="button">
                <ThemedText style={date ? undefined : st.ph}>{date ? fmtDate(date) : 'Selecciona una fecha'}</ThemedText>
              </TouchableOpacity>
              {err('date') && <ThemedText style={st.fieldErr}>{err('date')}</ThemedText>}
              {showAndroidDate && (
                <DateTimePicker value={date ?? new Date()} minimumDate={new Date()} mode="date" display="default"
                  onChange={(_, d) => { setShowAndroidDate(false); if (d) setDate(d); }} />
              )}
            </View>

            {/* Start time */}
            <View style={st.field}>
              <ThemedText type="defaultSemiBold" style={st.label}>Hora de Inicio</ThemedText>
              <TouchableOpacity onPress={openStart} style={[st.selector, err('start_time') && st.selectorErr]} accessibilityLabel="Seleccionar hora de inicio" accessibilityRole="button">
                <ThemedText style={startTime ? undefined : st.ph}>{startTime ? fmtTime(startTime) : 'Selecciona hora de inicio'}</ThemedText>
              </TouchableOpacity>
              {err('start_time') && <ThemedText style={st.fieldErr}>{err('start_time')}</ThemedText>}
              {showAndroidStart && (
                <DateTimePicker value={startTime ?? new Date()} mode="time" is24Hour display="default"
                  onChange={(_, d) => { setShowAndroidStart(false); if (d) setStartTime(d); }} />
              )}
            </View>

            {/* End time */}
            <View style={st.field}>
              <ThemedText type="defaultSemiBold" style={st.label}>Hora de Fin</ThemedText>
              <TouchableOpacity onPress={openEnd} style={[st.selector, err('end_time') && st.selectorErr]} accessibilityLabel="Seleccionar hora de fin" accessibilityRole="button">
                <ThemedText style={endTime ? undefined : st.ph}>{endTime ? fmtTime(endTime) : 'Selecciona hora de fin'}</ThemedText>
              </TouchableOpacity>
              {err('end_time') && <ThemedText style={st.fieldErr}>{err('end_time')}</ThemedText>}
              {showAndroidEnd && (
                <DateTimePicker value={endTime ?? new Date()} mode="time" is24Hour display="default"
                  onChange={(_, d) => { setShowAndroidEnd(false); if (d) setEndTime(d); }} />
              )}
            </View>

            {/* Image */}
            <View style={st.imgContainer}>
              <ThemedText type="defaultSemiBold" style={st.label}>Imagen (opcional, máx 5 MB)</ThemedText>
              <TouchableOpacity onPress={pickImage} style={st.imgBtn} disabled={loading} accessibilityLabel={imageUri ? 'Cambiar imagen del evento' : 'Seleccionar imagen del evento'} accessibilityRole="button">
                <ThemedText>{imageUri ? 'Cambiar Imagen' : 'Seleccionar Imagen'}</ThemedText>
              </TouchableOpacity>
              {imageUri && <Image source={{ uri: imageUri }} style={st.preview} accessibilityLabel="Vista previa de la imagen del evento" />}
            </View>

            <Button title="Crear Evento" onPress={handleSubmit} loading={loading} style={st.submit} />
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Category Modal ─────────────────────────────────────────── */}
      <BottomModal visible={catModal} title="Categoría" onDone={() => setCatModal(false)}>
        <FlatList
          data={CATEGORIES}
          keyExtractor={i => i.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[st.optRow, category === item.value && st.optRowSel]}
              onPress={() => { setCategory(item.value); setCatModal(false); }}
            >
              <ThemedText style={[st.optTxt, category === item.value && st.optTxtSel]}>{item.label}</ThemedText>
            </TouchableOpacity>
          )}
        />
      </BottomModal>

      {/* ── Date Modal ─────────────────────────────────────────────── */}
      <BottomModal visible={dateModal} title="Fecha del evento" onDone={() => { setDate(tmpDate); setDateModal(false); }}>
        <JSDatePicker value={tmpDate} onChange={setTmpDate} />
      </BottomModal>

      {/* ── Start Time Modal ───────────────────────────────────────── */}
      <BottomModal visible={startModal} title="Hora de inicio" onDone={() => { setStartTime(tmpStart); setStartModal(false); }}>
        <JSTimePicker value={tmpStart} onChange={setTmpStart} />
      </BottomModal>

      {/* ── End Time Modal ─────────────────────────────────────────── */}
      <BottomModal visible={endModal} title="Hora de fin" onDone={() => { setEndTime(tmpEnd); setEndModal(false); }}>
        <JSTimePicker value={tmpEnd} onChange={setTmpEnd} />
      </BottomModal>
    </ThemedView>
  );
}

// ---------------------------------------------------------------------------
// Main styles
// ---------------------------------------------------------------------------
const st = StyleSheet.create({
  container: { flex: 1 },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, paddingBottom: 48 },
  header: { gap: 8, marginBottom: 32, alignItems: 'center' },
  errBanner: { backgroundColor: '#fdecea', borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#dc3545' },
  errBannerTxt: { color: '#dc3545', textAlign: 'center' },
  successBanner: { backgroundColor: '#d4edda', borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#28a745' },
  successBannerTxt: { color: '#155724', textAlign: 'center' },
  form: { gap: 16 },
  submit: { marginTop: 16 },
  label: { marginBottom: 6 },
  field: { marginBottom: 4 },
  selector: { height: 50, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, justifyContent: 'center', paddingHorizontal: 16 },
  selectorErr: { borderColor: '#dc3545' },
  ph: { color: '#999' },
  fieldErr: { color: '#dc3545', fontSize: 12, marginTop: 4 },
  imgContainer: { marginBottom: 16 },
  imgBtn: { height: 50, borderWidth: 1, borderColor: '#ccc', borderStyle: 'dashed', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  preview: { width: '100%', height: 200, borderRadius: 8, resizeMode: 'cover' },
  optRow: { paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  optRowSel: { backgroundColor: '#EEF4FF' },
  optTxt: { fontSize: 16 },
  optTxtSel: { color: '#007AFF', fontWeight: '600' },
});
