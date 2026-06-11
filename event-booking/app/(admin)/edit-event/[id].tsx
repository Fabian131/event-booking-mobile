import { useEffect, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, View, TouchableOpacity, Image, FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedView } from '@/src/components/ui/themed-view';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { JSDatePicker } from '@/src/components/ui/JSDatePicker';
import { JSTimePicker } from '@/src/components/ui/JSTimePicker';
import { BottomModal } from '@/src/components/ui/BottomModal';
import { Loader } from '@/src/components/ui/Loader';
import { ApiError } from '@/src/types/auth';
import { validateCreateEventForm, mapServerErrors, type CreateEventFormValues } from '@/src/utils/validators';
import type { FieldError } from '@/src/types/auth';
import { eventsService } from '@/src/services/events';
import { EVENT_CATEGORIES } from '@/src/types/events';
import { EVENTS, ERRORS, VALIDATION, CATEGORY } from '@/src/constants/ui';
import { useEventDetail } from '@/src/hooks/useEventDetail';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const CATEGORIES = EVENT_CATEGORIES.map((value) => ({
  label: CATEGORY.LABELS[value],
  value,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmtDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function fmtTime(d: Date) { return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

function parseDateFromString(s: string): Date {
  const [year, month, day] = s.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function parseTimeFromString(s: string): Date {
  const [h, m] = s.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { event, loading: fetching, error: fetchError } = useEventDetail(id);

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
  const [initialized, setInitialized] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);

  const err = (f: string) => errors.find(e => e.field === f)?.message;
  const catLabel = CATEGORIES.find(c => c.value === category)?.label ?? EVENTS.CREATE_CATEGORY_PLACEHOLDER;

  useEffect(() => {
    if (event && !initialized) {
      setTitle(event.title);
      setDescription(event.description ?? '');
      setMaxCapacity(String(event.max_capacity));
      setCategory(event.category);
      setDate(parseDateFromString(event.date));
      setStartTime(parseTimeFromString(event.start_time));
      setEndTime(parseTimeFromString(event.end_time));
      setImageUri(event.image_url);
      setInitialized(true);
    }
  }, [event, initialized]);

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
        setServerError(VALIDATION.IMAGE_FORMAT);
        return;
      }
      setImageUri(asset.uri);
      setImageChanged(true);
    }
  }

  function buildUpdateFields(): Record<string, string> {
    const fields: Record<string, string> = {
      title: title.trim(),
      max_capacity: maxCapacity.trim(),
      category: category.toLowerCase(),
    };
    if (description.trim()) fields.description = description.trim();
    if (date) fields.date = fmtDate(date);
    if (startTime) fields.start_time = startTime.toTimeString().split(' ')[0];
    if (endTime) fields.end_time = endTime.toTimeString().split(' ')[0];
    return fields;
  }

  function buildFormData(): FormData {
    const fd = new FormData();
    Object.entries(buildUpdateFields()).forEach(([key, value]) => fd.append(key, value));
    if (imageUri && imageChanged) {
      const fn = imageUri.split('/').pop() ?? 'image.jpg';
      const m = /\.(\w+)$/.exec(fn);
      const file = {
        uri: imageUri,
        name: fn,
        type: m ? `image/${m[1]}` : 'application/octet-stream',
      };
      fd.append('image', file as unknown as Blob);
    }
    return fd;
  }

  function handleSubmit() {
    setErrors([]); setServerError(''); setSuccess(false);
    const vals: CreateEventFormValues = { title, description, max_capacity: maxCapacity, category, date, start_time: startTime, end_time: endTime, image: imageUri };
    const clientErrors = validateCreateEventForm(vals);
    if (clientErrors.length > 0) { setErrors(clientErrors); return; }

    Alert.alert(
      EVENTS.EDIT_CONFIRM_TITLE,
      EVENTS.EDIT_CONFIRM_MESSAGE,
      [
        { text: EVENTS.EDIT_CONFIRM_CANCEL, style: 'cancel' },
        { text: EVENTS.EDIT_CONFIRM_OK, onPress: () => doUpdate() },
      ],
    );
  }

  async function doUpdate() {
    setLoading(true);
    try {
      const fd = buildFormData();
      const updated = await eventsService.update(id, fd);
      setImageUri(updated.image_url);
      setImageChanged(false);
      setServerError('');
      setSuccess(true);
      setTimeout(() => router.back(), 1200);
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.details?.length) {
          if (e.details.find(d => d.field === 'schedule')) {
            setServerError(ERRORS.SCHEDULE_CONFLICT);
            return;
          }
          setErrors(mapServerErrors(e.details));
          return;
        }
        setServerError(e.message);
      } else if (e instanceof TypeError) {
        setServerError(ERRORS.NETWORK);
      } else {
        setServerError(ERRORS.GENERIC);
      }
    } finally { setLoading(false); }
  }

  if (fetching) {
    return <Loader message={EVENTS.EDIT_LOADING} />;
  }

  if (fetchError || !event) {
    return (
      <ThemedView style={st.center}>
        <ThemedText>{fetchError ?? ERRORS.EVENT_LOAD_ERROR}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={st.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={st.kav}>
        <ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled">

          <ThemedView style={st.header}>
            <ThemedText type="title">{EVENTS.EDIT_TITLE}</ThemedText>
            <ThemedText>{EVENTS.EDIT_SUBTITLE}</ThemedText>
          </ThemedView>

          {success ? (
            <View style={st.successBanner}>
              <ThemedText style={st.successBannerTxt}>{EVENTS.EDIT_SUCCESS}</ThemedText>
            </View>
          ) : null}

          {serverError ? (
            <View style={st.errBanner}>
              <ThemedText style={st.errBannerTxt}>{serverError}</ThemedText>
            </View>
          ) : null}

          <ThemedView style={st.form}>
            <Input label={EVENTS.CREATE_TITLE_LABEL} placeholder={EVENTS.CREATE_TITLE_PLACEHOLDER} value={title} onChangeText={setTitle} error={err('title')} editable={!loading} />
            <Input label={EVENTS.CREATE_DESCRIPTION_LABEL} placeholder={EVENTS.CREATE_DESCRIPTION_PLACEHOLDER} value={description} onChangeText={setDescription} error={err('description')} editable={!loading} />
            <Input label={EVENTS.CREATE_CAPACITY_LABEL} placeholder={EVENTS.CREATE_CAPACITY_PLACEHOLDER} value={maxCapacity} onChangeText={setMaxCapacity} error={err('max_capacity')} editable={!loading} keyboardType="numeric" />

            {/* Category */}
            <View style={st.field}>
              <ThemedText type="defaultSemiBold" style={st.label}>{EVENTS.CREATE_CATEGORY_LABEL}</ThemedText>
              <TouchableOpacity onPress={() => !loading && setCatModal(true)} style={[st.selector, err('category') && st.selectorErr]} accessibilityLabel={EVENTS.CREATE_CATEGORY_ACCESSIBILITY} accessibilityRole="button">
                <ThemedText style={category ? undefined : st.ph}>{catLabel}</ThemedText>
              </TouchableOpacity>
              {err('category') && <ThemedText style={st.fieldErr}>{err('category')}</ThemedText>}
            </View>

            {/* Date */}
            <View style={st.field}>
              <ThemedText type="defaultSemiBold" style={st.label}>{EVENTS.CREATE_DATE_LABEL}</ThemedText>
              <TouchableOpacity onPress={openDate} style={[st.selector, err('date') && st.selectorErr]} accessibilityLabel={EVENTS.CREATE_DATE_ACCESSIBILITY} accessibilityRole="button">
                <ThemedText style={date ? undefined : st.ph}>{date ? fmtDate(date) : EVENTS.CREATE_DATE_PLACEHOLDER}</ThemedText>
              </TouchableOpacity>
              {err('date') && <ThemedText style={st.fieldErr}>{err('date')}</ThemedText>}
              {showAndroidDate && (
                <DateTimePicker value={date ?? new Date()} minimumDate={new Date()} mode="date" display="default"
                  onChange={(_, d) => { setShowAndroidDate(false); if (d) setDate(d); }} />
              )}
            </View>

            {/* Start time */}
            <View style={st.field}>
              <ThemedText type="defaultSemiBold" style={st.label}>{EVENTS.CREATE_START_LABEL}</ThemedText>
              <TouchableOpacity onPress={openStart} style={[st.selector, err('start_time') && st.selectorErr]} accessibilityLabel={EVENTS.CREATE_START_ACCESSIBILITY} accessibilityRole="button">
                <ThemedText style={startTime ? undefined : st.ph}>{startTime ? fmtTime(startTime) : EVENTS.CREATE_START_PLACEHOLDER}</ThemedText>
              </TouchableOpacity>
              {err('start_time') && <ThemedText style={st.fieldErr}>{err('start_time')}</ThemedText>}
              {showAndroidStart && (
                <DateTimePicker value={startTime ?? new Date()} mode="time" is24Hour display="default"
                  onChange={(_, d) => { setShowAndroidStart(false); if (d) setStartTime(d); }} />
              )}
            </View>

            {/* End time */}
            <View style={st.field}>
              <ThemedText type="defaultSemiBold" style={st.label}>{EVENTS.CREATE_END_LABEL}</ThemedText>
              <TouchableOpacity onPress={openEnd} style={[st.selector, err('end_time') && st.selectorErr]} accessibilityLabel={EVENTS.CREATE_END_ACCESSIBILITY} accessibilityRole="button">
                <ThemedText style={endTime ? undefined : st.ph}>{endTime ? fmtTime(endTime) : EVENTS.CREATE_END_PLACEHOLDER}</ThemedText>
              </TouchableOpacity>
              {err('end_time') && <ThemedText style={st.fieldErr}>{err('end_time')}</ThemedText>}
              {showAndroidEnd && (
                <DateTimePicker value={endTime ?? new Date()} mode="time" is24Hour display="default"
                  onChange={(_, d) => { setShowAndroidEnd(false); if (d) setEndTime(d); }} />
              )}
            </View>

            {/* Image */}
            <View style={st.imgContainer}>
              <ThemedText type="defaultSemiBold" style={st.label}>{EVENTS.CREATE_IMAGE_LABEL}</ThemedText>
              <TouchableOpacity onPress={pickImage} style={st.imgBtn} disabled={loading} accessibilityLabel={imageUri ? EVENTS.CREATE_IMAGE_CHANGE_ACCESSIBILITY : EVENTS.CREATE_IMAGE_SELECT_ACCESSIBILITY} accessibilityRole="button">
                <ThemedText>{imageUri ? EVENTS.CREATE_IMAGE_CHANGE : EVENTS.CREATE_IMAGE_SELECT}</ThemedText>
              </TouchableOpacity>
              {imageUri && <Image source={{ uri: imageUri }} style={st.preview} accessibilityLabel={EVENTS.CREATE_IMAGE_PREVIEW_ACCESSIBILITY} />}
            </View>

            <Button title={EVENTS.EDIT_BUTTON} onPress={handleSubmit} loading={loading} style={st.submit} />
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Category Modal ─────────────────────────────────────────── */}
      <BottomModal visible={catModal} title={EVENTS.CREATE_MODAL_CATEGORY_TITLE} doneLabel={EVENTS.CREATE_MODAL_DONE} onDone={() => setCatModal(false)}>
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
      <BottomModal visible={dateModal} title={EVENTS.CREATE_MODAL_DATE_TITLE} doneLabel={EVENTS.CREATE_MODAL_DONE} onDone={() => { setDate(tmpDate); setDateModal(false); }}>
        <JSDatePicker value={tmpDate} onChange={setTmpDate} />
      </BottomModal>

      {/* ── Start Time Modal ───────────────────────────────────────── */}
      <BottomModal visible={startModal} title={EVENTS.CREATE_MODAL_START_TITLE} doneLabel={EVENTS.CREATE_MODAL_DONE} onDone={() => { setStartTime(tmpStart); setStartModal(false); }}>
        <JSTimePicker value={tmpStart} onChange={setTmpStart} />
      </BottomModal>

      {/* ── End Time Modal ─────────────────────────────────────────── */}
      <BottomModal visible={endModal} title={EVENTS.CREATE_MODAL_END_TITLE} doneLabel={EVENTS.CREATE_MODAL_DONE} onDone={() => { setEndTime(tmpEnd); setEndModal(false); }}>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
});
