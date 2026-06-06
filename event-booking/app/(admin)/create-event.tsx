import { useState } from 'react';
import {
  KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView,
  StyleSheet, View, TouchableOpacity, Image, FlatList,
} from 'react-native';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedView } from '@/src/components/ui/themed-view';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { ApiError } from '@/src/types/auth';
import { validateCreateEventForm, type CreateEventFormValues } from '@/src/utils/validators';
import type { FieldError } from '@/src/types/auth';
import { eventService } from '@/src/services/eventService';

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

const MONTH_NAMES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmtDate(d: Date) { return d.toISOString().split('T')[0]; }
function fmtTime(d: Date) { return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

// ---------------------------------------------------------------------------
// Pure-JS UnitSpinner (works everywhere, no native deps)
// ---------------------------------------------------------------------------
function UnitSpinner({ label, value, onUp, onDown }: {
  label: string; value: string; onUp: () => void; onDown: () => void;
}) {
  return (
    <View style={pSt.unit}>
      <ThemedText style={pSt.unitLabel}>{label}</ThemedText>
      <TouchableOpacity onPress={onUp} style={pSt.btn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <ThemedText style={pSt.arrow}>{'▲'}</ThemedText>
      </TouchableOpacity>
      <View style={pSt.box}>
        <ThemedText style={pSt.val}>{value}</ThemedText>
      </View>
      <TouchableOpacity onPress={onDown} style={pSt.btn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <ThemedText style={pSt.arrow}>{'▼'}</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

// ---------------------------------------------------------------------------
// JSDatePicker
// ---------------------------------------------------------------------------
function JSDatePicker({ value, onChange }: { value: Date; onChange: (d: Date) => void }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  function clamp(d: Date) { const c = new Date(d); c.setHours(0,0,0,0); return c < today ? new Date(today) : c; }
  function adj(fn: (d: Date) => void) { const d = new Date(value); fn(d); onChange(clamp(d)); }

  return (
    <View style={pSt.row}>
      <UnitSpinner label="Día" value={String(value.getDate()).padStart(2,'0')}
        onUp={() => adj(d => d.setDate(d.getDate()+1))} onDown={() => adj(d => d.setDate(d.getDate()-1))} />
      <UnitSpinner label="Mes" value={MONTH_NAMES[value.getMonth()]}
        onUp={() => adj(d => d.setMonth(d.getMonth()+1))} onDown={() => adj(d => d.setMonth(d.getMonth()-1))} />
      <UnitSpinner label="Año" value={String(value.getFullYear())}
        onUp={() => adj(d => d.setFullYear(d.getFullYear()+1))} onDown={() => adj(d => d.setFullYear(d.getFullYear()-1))} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// JSTimePicker
// ---------------------------------------------------------------------------
function JSTimePicker({ value, onChange }: { value: Date; onChange: (d: Date) => void }) {
  function adj(fn: (d: Date) => void) { const d = new Date(value); fn(d); onChange(d); }

  return (
    <View style={pSt.row}>
      <UnitSpinner label="Hora" value={String(value.getHours()).padStart(2,'0')}
        onUp={() => adj(d => d.setHours((d.getHours()+1)%24))} onDown={() => adj(d => d.setHours((d.getHours()+23)%24))} />
      <View style={pSt.colon}><ThemedText style={pSt.colonTxt}>:</ThemedText></View>
      <UnitSpinner label="Min" value={String(value.getMinutes()).padStart(2,'0')}
        onUp={() => adj(d => d.setMinutes((d.getMinutes()+1)%60))} onDown={() => adj(d => d.setMinutes((d.getMinutes()+59)%60))} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// BottomSheet modal wrapper
// ---------------------------------------------------------------------------
function BottomModal({ visible, title, onDone, children }: {
  visible: boolean; title: string; onDone: () => void; children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={st.overlay} onPress={onDone}>
        <View style={st.sheet}>
          <View style={st.sheetHeader}>
            <ThemedText style={st.sheetTitle}>{title}</ThemedText>
            <TouchableOpacity onPress={onDone}>
              <ThemedText style={st.doneBtn}>Listo</ThemedText>
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </Pressable>
    </Modal>
  );
}

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
      await eventService.createEvent(fd);
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
// Picker styles
// ---------------------------------------------------------------------------
const pSt = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16, gap: 8 },
  unit: { alignItems: 'center', flex: 1 },
  unitLabel: { fontSize: 11, color: '#888', marginBottom: 6 },
  btn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4FF', borderRadius: 8 },
  arrow: { fontSize: 14, color: '#1A56DB' },
  box: { width: 70, height: 54, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EEF4FF', borderRadius: 10, marginVertical: 6, borderWidth: 1.5, borderColor: '#C5D8FF' },
  val: { fontSize: 24, fontWeight: '700', color: '#1A56DB' },
  colon: { alignItems: 'center', paddingTop: 30 },
  colonTxt: { fontSize: 26, fontWeight: '700', color: '#555' },
});

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
  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 32 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ddd' },
  sheetTitle: { fontSize: 16, fontWeight: '600' },
  doneBtn: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
  optRow: { paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  optRowSel: { backgroundColor: '#EEF4FF' },
  optTxt: { fontSize: 16 },
  optTxtSel: { color: '#007AFF', fontWeight: '600' },
});
