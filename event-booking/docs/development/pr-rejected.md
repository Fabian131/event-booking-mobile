# QA Review: REJECTED

## Template

```markdown
# QA Review: REJECTED ([Reason for Rejection])
**Reviewer:** [Your Name] (QA)
**Reference:** [EVB-XXX] ([Feature Name])

---

### Verification Summary
I have completed the review of this Pull Request. While [mention what works
correctly], the implementation has been **REJECTED** due to **[brief description
of the critical problem]** that must be resolved before approval.

### Implementation Status:
- **[Area 1]**: REJECTED. [Reason]
- **[Area 2]**: FAILURE. [Reason]
- **[Area 3]**: WARNING. [Minor issue]

---

### Required Fixes

#### 1. [Fix Title]
**File:** `event-booking/[path/to/file]`
**Line:** [Line number]

**Current code:**
```tsx
// Current code with the problem
```

**Expected code:**
```tsx
// Corrected code expected
```

**Reason:** [Explanation of why the current code is incorrect and why the proposed
change is necessary.]

---

#### 2. [Fix Title]
**File:** `event-booking/[path/to/file]`
**Line:** [Line number]

**Current code:**
```tsx
// Current code
```

**Expected code:**
```tsx
// Corrected code
```

**Reason:** [Explanation]

---

### Verdict:
**REJECTED** — [Brief explanation of why the PR cannot be merged and what must be
fixed to meet the project standards.]

The developer must address all required fixes and request a new review.

---
**Date:** [YYYY-MM-DD]
```

---

## Example

```markdown
# QA Review: REJECTED (Missing Server Error Handling in Register Screen)
**Reviewer:** Fabian Sanchez Salinas (QA)
**Reference:** [EVB-001] (User Registration Screen)

---

### Verification Summary
I have completed the review of this Pull Request. The form layout and client-side
validation work correctly, but the implementation has been **REJECTED** due to **missing
server error handling for 409 conflict responses** and **the password input lacking a
visibility toggle** that must be resolved before approval.

### Implementation Status:
- **Form Layout**: PASS. All 6 fields render correctly with labels and placeholders.
- **Client Validation**: PASS. All 19 validation rules trigger correctly.
- **Server Error Handling**: REJECTED. 409 conflict responses are not displayed to the user.
- **Password Security**: FAILURE. Password fields have no show/hide toggle.
- **Loading State**: WARNING. Button shows a spinner, but inputs are not disabled during loading.

---

### Required Fixes

#### 1. Handle 409 Conflict Responses
**File:** `event-booking/app/(auth)/register.tsx`
**Line:** 52

**Current code:**
```tsx
if (err instanceof ApiError) {
  if (err.status === 422 && err.details) {
    setErrors(err.details);
  }
  setServerError(err.message);
}
```

**Expected code:**
```tsx
if (err instanceof ApiError) {
  if (err.details && err.details.length > 0) {
    setErrors(err.details);
  }
  setServerError(err.message);
}
```

**Reason:** The 409 conflict response also returns `details[]` with field-level errors
(e.g., "Email already registered", "Phone number already registered"). The current
code only renders `details[]` for 422, ignoring 409. The fix should render `details[]`
regardless of the status code since both 422 and 409 use the same `ValidationError`
schema.

---

#### 2. Add Password Visibility Toggle
**File:** `event-booking/src/components/ui/Input.tsx`
**Line:** 10

**Current code:**
```tsx
<TextInput
  style={[styles.input, hasError && styles.inputError]}
  placeholderTextColor="#9ba1a6"
  autoCapitalize="none"
  {...rest}
/>
```

**Expected code:**
```tsx
<View style={styles.inputWrapper}>
  <TextInput
    style={[styles.input, secureTextEntry && styles.inputWithToggle, hasError && styles.inputError]}
    placeholderTextColor="#9ba1a6"
    autoCapitalize="none"
    secureTextEntry={secureTextEntry && !showPassword}
    {...rest}
  />
  {secureTextEntry && (
    <TouchableOpacity style={styles.toggle} onPress={() => setShowPassword(prev => !prev)}>
      <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={22} color="#687076" />
    </TouchableOpacity>
  )}
</View>
```

**Reason:** Password fields must provide a visibility toggle (eye icon) so users can
verify what they typed. This is a UX standard across all mobile apps. The `Input`
component already accepts `secureTextEntry` as a prop; it needs to conditionally
render the toggle icon and manage the `showPassword` state internally.

---

### Verdict:
**REJECTED** — The PR has a missing server error path (409 handling) and a missing
UI feature (password toggle). Both issues affect user experience and must be fixed
before this PR can be approved.

The developer must address all required fixes and request a new review.

---
**Date:** 2026-06-05
```

---

**Last updated**: June 5, 2026
