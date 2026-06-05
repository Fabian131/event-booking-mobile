# Testing Guide — Event Booking Mobile

> How to write, run, and verify tests for the Event Booking frontend (Expo React Native).
> Tests are organized into three complementary layers: **Unit**, **Feature**, and **Browser**.

---

## Table of Contents

1. [Test Layers](#test-layers)
2. [Test Stack](#test-stack)
3. [Project Structure](#project-structure)
4. [Naming Convention](#naming-convention)
5. [Running Tests](#running-tests)
6. [Unit Tests](#unit-tests)
7. [Feature Tests](#feature-tests)
8. [Browser Tests](#browser-tests)
9. [Jest Configuration](#jest-configuration)
10. [Mocking Patterns](#mocking-patterns)
11. [CI Pipeline](#ci-pipeline)
12. [Best Practices](#best-practices)
13. [Quick Reference](#quick-reference)

---

## Test Layers

The project uses a **three-layer testing strategy**. Each layer has a distinct
scope, speed, and purpose. When a test fails, the layer tells you exactly where
the problem is.

```
┌──────────────────────────────────────────────────────────┐
│  Browser Tests   —  Full user journeys, multi-step flows   │  Slowest
│                     fireEvent sequences, state transitions │  ~5-7s each
├──────────────────────────────────────────────────────────┤
│  Feature Tests   —  One screen, mocked API, UI behavior   │  Medium
│                     render() + fireEvent + waitFor         │  ~5-7s each
├──────────────────────────────────────────────────────────┤
│  Unit Tests      —  Pure functions, isolated logic        │  Fastest
│                     Validators, helpers, formatters        │  < 1ms each
└──────────────────────────────────────────────────────────┘
```

| Layer | Tests What | Runs In | Dependencies | Speed |
|-------|-----------|---------|-------------|-------|
| **Unit** | Pure functions in isolation | Memory only | None | Sub-millisecond |
| **Feature** | One component + mocked services | JSDOM | `@testing-library/react-native` | Seconds |
| **Browser** | Multi-step user journeys | JSDOM | `@testing-library/react-native` | Seconds |

If a unit test fails: a pure function has a logic bug.  
If a feature test fails: a screen's UI behavior is broken.  
If a browser test fails: a multi-step user flow is broken.

---

## Test Stack

| Tool | Version | Purpose |
|------|---------|---------|
| [Jest](https://jestjs.io/) | 29.x | Test runner, assertions, mocking |
| [jest-expo](https://docs.expo.dev/develop/unit-testing/) | 56.x | Expo preset for Jest (transforms, mocks) |
| [@testing-library/react-native](https://callstack.github.io/react-native-testing-library/) | 13.x | Render components, query elements, fire events |
| [react-test-renderer](https://reactjs.org/docs/test-renderer.html) | 19.1.0 | Lightweight React renderer for tests |
| [@expo/vector-icons](https://icons.expo.fyi/) | 15.x | Icon library (mocked in tests) |

---

## Project Structure

```
tests/
├── Unit/
│   └── register/
│       ├── ValidInputUnitTest.ts
│       ├── FirstNameValidationUnitTest.ts
│       ├── LastNameValidationUnitTest.ts
│       ├── EmailValidationUnitTest.ts
│       ├── PhoneValidationUnitTest.ts
│       ├── PasswordStrengthValidationUnitTest.ts
│       ├── ConfirmPasswordValidationUnitTest.ts
│       └── MultipleErrorsUnitTest.ts
├── Feature/
│   └── register/
│       ├── RenderFormFeatureTest.tsx
│       ├── EmptySubmitFeatureTest.tsx
│       ├── EmailFormatFeatureTest.tsx
│       ├── PasswordMismatchFeatureTest.tsx
│       ├── ValidSubmitFeatureTest.tsx
│       ├── ServerErrorFeatureTest.tsx
│       └── NetworkErrorFeatureTest.tsx
└── Browser/
    └── register/
        ├── RegistrationFlowBrowserTest.tsx
        ├── NavigationBrowserTest.tsx
        └── FormInteractionBrowserTest.tsx
```

Each module gets its own subdirectory under each test layer (e.g., `Unit/register/`,
`Feature/register/`, `Browser/register/`). Module documentation lives in
`docs/modules/[module].md`.

---

## Naming Convention

Files follow the pattern: `[TestName][TestType]Test.ts` (or `.tsx` for React components).

| Test Type | Suffix        | Extension | Example                                      | Jest Match Pattern |
|-----------|---------------|-----------|----------------------------------------------|---------------------|
| Unit      | `UnitTest`    | `.ts`     | `FirstNameValidationUnitTest.ts`             | `**/Unit/**/*UnitTest.ts` |
| Feature   | `FeatureTest` | `.tsx`    | `RenderFormFeatureTest.tsx`                  | `**/Feature/**/*FeatureTest.tsx` |
| Browser   | `BrowserTest` | `.tsx`    | `RegistrationFlowBrowserTest.tsx`            | `**/Browser/**/*BrowserTest.tsx` |

The `testMatch` patterns are configured in `package.json` under the `jest` key.
Jest will automatically discover files matching these patterns.

---

## Running Tests

### Prerequisites

```bash
npm ci
```

### Run all tests

```bash
npm test
```

### Run by layer

```bash
# Unit tests only (fastest — run this most often during development)
npx jest tests/Unit/

# Feature tests only
npx jest tests/Feature/

# Browser tests only
npx jest tests/Browser/

# Unit + Feature (skip Browser)
npx jest tests/Unit/ tests/Feature/
```

### Run specific module

```bash
npx jest tests/Unit/register/
npx jest tests/Feature/register/
npx jest tests/Browser/register/
```

### Run single file

```bash
npx jest tests/Unit/register/PasswordStrengthValidationUnitTest
```

### Watch mode (re-run on file changes)

```bash
npx jest --watch
```

### Verbose with coverage

```bash
npx jest --ci --coverage --verbose
```

---

## Unit Tests

### What They Test

Pure TypeScript/JavaScript functions with **no React rendering**, no API calls,
no file system. Only logic in memory.

### File Extension

`.ts` — no JSX needed.

### Pattern

```typescript
// tests/Unit/register/FirstNameValidationUnitTest.ts
import { validateRegistrationForm, type RegisterFormValues } from '@/src/utils/validators';

function base(): RegisterFormValues {
  return {
    first_name: 'Maria', last_name: 'Garcia', email: 'user@example.com',
    phone: '', password: 'Test1234#', confirmPassword: 'Test1234#',
  };
}

describe('first name validation', () => {
  it('should reject empty first_name', () => {
    const errors = validateRegistrationForm({ ...base(), first_name: '' });
    expect(errors.some((e) => e.field === 'first_name')).toBe(true);
  });

  it('should reject first_name with numbers', () => {
    const errors = validateRegistrationForm({ ...base(), first_name: 'J0hn' });
    expect(errors.some((e) => e.field === 'first_name')).toBe(true);
  });

  it('should accept first_name with hyphens and apostrophes', () => {
    const errors = validateRegistrationForm({ ...base(), first_name: "O'Connor-Smith" });
    expect(errors.filter((e) => e.field === 'first_name')).toHaveLength(0);
  });
});
```

### Unit Test Rules
- **No `@testing-library/react-native` imports** — the library is not needed
- **No `render()`** — no React components rendered
- **No `jest.mock()`** — pure functions don't need mocks
- **No `async/await`** — everything is synchronous
- **No `@expo/vector-icons` mock** — not needed
- **Sub-millisecond execution** — all unit tests should complete in < 1 second

---

## Feature Tests

### What They Test

One screen/component rendered in isolation, with mocked API services. Verify
UI behavior: rendering, validation flow, API calls, error display, and loading
states.

### File Extension

`.tsx` — JSX required for rendering components.

### Required Mocks

Every Feature test file needs these mocks at the top:

```typescript
jest.mock('@/src/services/auth');          // Mock the API service
jest.mock('expo-router', () => ({          // Mock Expo Router
  Link: ({ children }: { children: React.ReactNode }) => children,
  router: { replace: jest.fn() },
  useLocalSearchParams: () => ({}),
}));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');  // Mock icons
```

### Pattern

```typescript
// tests/Feature/register/ServerErrorFeatureTest.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider } from '@/src/context/AuthContext';
import { authService } from '@/src/services/auth';
import { ApiError } from '@/src/types/auth';
import RegisterScreen from '@/app/(auth)/register';

jest.mock('@/src/services/auth');
jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  router: { replace: jest.fn() },
  useLocalSearchParams: () => ({}),
}));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

describe('server validation errors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display server errors from API details array', async () => {
    (authService.register as jest.Mock).mockRejectedValueOnce(
      new ApiError('Validation failed', 422, [
        { field: 'email', message: 'Email domain does not exist' },
      ]),
    );

    render(
      <AuthProvider>
        <RegisterScreen />
      </AuthProvider>,
    );

    // Fill form with valid data that will pass client-side validation
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu nombre'), 'John');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu apellido'), 'Doe');
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu correo'), 'test@invalid-domain.xyz');
    fireEvent.changeText(screen.getByPlaceholderText('Crea una contrasena'), 'Test1234#');
    fireEvent.changeText(screen.getByPlaceholderText('Confirma tu contrasena'), 'Test1234#');

    fireEvent.press(screen.getByText('Registrarse'));

    await waitFor(() => {
      expect(screen.getByText('Email domain does not exist')).toBeTruthy();
    });
  });
});
```

### Feature Test Rules
- **Wrap screens in required providers** — `AuthProvider`, theme providers, etc.
- **Mock ALL external dependencies** — `authService`, `expo-router`, `@expo/vector-icons`
- **Use `waitFor` for async state changes** — error rendering, loading states, navigation
- **One scenario per file** — each file tests one specific behavior
- **Use `jest.clearAllMocks()` in `beforeEach`** — prevents test pollution
- **Use `jest.setTimeout(15000)` for slow tests** — React Native rendering is slow in JSDOM

---

## Browser Tests

### What They Test

Complete user journeys across multiple interactions within one screen. Simulate
real user behavior: filling forms across multiple steps, correcting errors,
toggling UI elements, and verifying navigation and state transitions.

### File Extension

`.tsx` — JSX required.

### Required Mocks

Same as Feature tests.

### Pattern

```typescript
// tests/Browser/register/FormInteractionBrowserTest.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider } from '@/src/context/AuthContext';
import { authService } from '@/src/services/auth';
import RegisterScreen from '@/app/(auth)/register';

jest.mock('@/src/services/auth');
jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  router: { replace: jest.fn() },
  useLocalSearchParams: () => ({}),
}));
jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

describe('form interaction patterns', () => {
  jest.setTimeout(15000);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should clear errors when user corrects invalid field and resubmits', async () => {
    (authService.register as jest.Mock).mockResolvedValueOnce({ ... });

    render(
      <AuthProvider>
        <RegisterScreen />
      </AuthProvider>,
    );

    // Step 1: Submit empty to trigger errors
    fireEvent.press(screen.getByText('Registrarse'));
    await waitFor(() => {
      expect(screen.getByText('El nombre es obligatorio')).toBeTruthy();
    });

    // Step 2: Correct all fields
    fireEvent.changeText(screen.getByPlaceholderText('Ingresa tu nombre'), 'Maria');
    // ... fill remaining fields ...

    // Step 3: Resubmit — errors should be gone
    fireEvent.press(screen.getByText('Registrarse'));
    await waitFor(() => {
      expect(authService.register).toHaveBeenCalled();
    });
    expect(screen.queryByText('El nombre es obligatorio')).toBeNull();
  });
});
```

### Browser Test Rules
- **Multi-step flows** — test state transitions (error → correction → success)
- **Verify UI element properties** — `secureTextEntry`, `props.editable`, `props.value`
- **Test error clearing** — after correcting a field, previous errors should disappear
- **Higher timeouts** — use `jest.setTimeout(15000)` for longer flows
- **Avoid testing the same thing as Feature tests** — Browser tests cover journeys, not single behaviors

---

## Jest Configuration

Defined in `package.json` under the `jest` key:

```json
{
  "jest": {
    "preset": "jest-expo",
    "testMatch": [
      "**/tests/Unit/**/*UnitTest.ts",
      "**/tests/Feature/**/*FeatureTest.tsx",
      "**/tests/Browser/**/*BrowserTest.tsx"
    ],
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|...)"
    ]
  }
}
```

- **`preset: "jest-expo"`** — provides Expo-specific transforms and mocks
- **`testMatch`** — custom patterns to discover test files by naming convention
- **`transformIgnorePatterns`** — allows Jest to transform ESM packages from `node_modules`

### Peer dependency note

The project uses `react@19.1.0`. `jest-expo@56` depends on `@react-native/jest-preset`
which expects `react@^19.2.3`. The `.npmrc` file contains `legacy-peer-deps=true`
to allow `npm ci` to succeed on CI despite this mismatch. The actual test suite
runs without issues.

---

## Mocking Patterns

### Mock API services

```typescript
jest.mock('@/src/services/auth');

// In the test:
(authService.register as jest.Mock).mockResolvedValueOnce({ ... });    // Success
(authService.register as jest.Mock).mockRejectedValueOnce(error);      // Failure
```

### Mock Expo Router

```typescript
jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  router: { replace: jest.fn() },
  useLocalSearchParams: () => ({}),
}));
```

### Mock Expo icons

```typescript
jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');
```

This prevents `expo-font` and `expo-asset` import chains that fail in the Jest
environment.

### Add new mocks

When adding new dependencies that fail in Jest, add a mock in the test file or
a global mock in a `tests/__mocks__/` directory.

---

## CI Pipeline

Defined in `.github/workflows/ci.yml` at the repository root. Runs on every push
and PR to `main`/`dev`.

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with:
      node-version: '22'
      cache: 'npm'
      cache-dependency-path: event-booking/package-lock.json
  - run: npm ci
    working-directory: event-booking
  - run: npx expo lint
    working-directory: event-booking
  - run: npx jest --ci --coverage
    working-directory: event-booking
```

---

## Best Practices

### 1. Run fastest tests first

During development, run tests in order of speed:

```bash
npx jest tests/Unit/                        # < 1 second
npx jest tests/Unit/ tests/Feature/         # ~6 seconds
npm test                                    # full suite
```

### 2. One behavior per test file

Each test file covers one category (Unit: one validation rule, Feature: one screen
behavior, Browser: one user journey).

### 3. Use descriptive test data

```typescript
// Good — data tells a story
email: 'duplicate-test@example.com'

// Avoid — meaningless
email: 'a@b.com'
```

### 4. Clean mocks between tests

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

### 5. Test edge cases

For every validation rule, test:
- Valid input
- Empty/missing input
- Boundary values (min, max, just below, just above)
- Invalid characters
- Unicode/accented characters

### 6. Verify error clearing

When a user corrects an invalid field and resubmits, the previous errors should
be gone. Test this explicitly in Browser tests.

---

## Quick Reference

```bash
# BY LAYER
npx jest tests/Unit/          # Unit tests (< 1s)
npx jest tests/Feature/       # Feature tests (~6s)
npx jest tests/Browser/       # Browser tests (~6s)

# BY MODULE
npx jest tests/Unit/register/
npx jest tests/Feature/register/
npx jest tests/Browser/register/

# SINGLE FILE
npx jest tests/Unit/register/PasswordStrengthValidationUnitTest

# WATCH MODE
npx jest --watch

# VERBOSE + COVERAGE
npx jest --ci --coverage --verbose

# LINT
npx expo lint
```

---

**Last updated**: June 5, 2026
