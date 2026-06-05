# PR Template

Standard format for all Pull Requests in the Event Booking Mobile project.

---

# [EVB-XXX] <type>(<scope>): <short description>

### Description
[Clear description of what this PR does and why. Context needed for the reviewer
to understand the change. Reference the API contract file if applicable.]

---

### Ticket
**EVB-XXX**: [Ticket/user story description]

**Sub-Tasks:**
- EVB-XXX.1: [Sub-task 1]
- EVB-XXX.2: [Sub-task 2]

---

### Changes Implemented

#### API Contract
- [Link or reference to the `api-contracts/*.yaml` file implemented]

#### Types
- [Created/updated TypeScript interfaces matching the API contract schemas]

#### Validators
- [Client-side validation functions with accumulated error support]

#### Services
- [API service calls (auth.ts, api.ts) integrating with the endpoint]

#### Context / State
- [Context updates or new hooks for state management]

#### Components
- [New or updated reusable components (Input, Button, Loader, etc.)]

#### Screen
- [Screen implementation with form state, error handling, loading states]

#### Tests
- [Unit tests for validators + integration tests for the screen]

---

### Modified Files

| File | Description |
|------|-------------|
| `src/types/[module].ts` | [TypeScript interfaces] |
| `src/utils/validators.ts` | [Client-side validation logic] |
| `src/services/[service].ts` | [API service calls] |
| `src/context/[context].tsx` | [State management] |
| `src/components/ui/[Component].tsx` | [Reusable UI component] |
| `src/components/domain/[Component].tsx` | [Domain-specific component] |
| `app/(auth)/[screen].tsx` | [Screen implementation] |
| `app/_layout.tsx` | [Root layout changes if applicable] |
| `tests/[module].test.tsx` | [Integration tests] |

---

### API Contract Reference

**File:** `api-contracts/[file].yaml`

| Method | Route              | Auth | Description    |
|--------|--------------------|------|----------------|
| POST   | `/api/v1/...`      | No   | [Description]  |
| GET    | `/api/v1/...`      | Yes  | [Description]  |

---

### Technical Details
- **[Detail 1]**: [Relevant technical explanation]
- **[Detail 2]**: [Pattern or design decision applied]
- **[Detail 3]**: [New dependency or package if applicable]

---

### Important Notes

> **NOTE:** [Information the reviewer should keep in mind.]

> **WARNING:** [Warnings about changes that could affect other parts of the app.]

---

### UI Behavior

| State              | What the user sees                                    |
|--------------------|-------------------------------------------------------|
| **Initial**        | [Initial state of the screen]                         |
| **Client error**   | [Per-field red border + error messages]               |
| **Server error**   | [Red banner + per-field errors from API `details[]`]  |
| **Loading**        | [Button spinner, inputs disabled]                     |
| **Success**        | [Navigation to next screen / success feedback]        |
| **Network error**  | [Connection error banner]                             |

---

### Error Handling

| Error              | Trigger                                | UI Feedback          |
|--------------------|----------------------------------------|----------------------|
| [Client error]     | [Validation rule broken]               | Field-level red text |
| [Server 422]       | API validation failure                 | `details[]` per field|
| [Server 409]       | Duplicate resource                     | `details[]` per field|
| [Server 500]       | Unexpected server error                | Generic error banner |
| [Network]          | `fetch` throws `TypeError`             | Connection banner    |

---

### How to Test

1. Install dependencies:
   ```bash
   npm ci
   ```

2. Run lint:
   ```bash
   npx expo lint
   ```

3. Run tests:
   ```bash
   npx jest --ci
   ```

4. Start the app:
   ```bash
   npx expo start
   ```

5. Navigate to the screen and verify:
   - Empty form shows all fields
   - Client validation triggers on submit
   - API integration works (success + error responses)
   - Loading state displays during request
   - Navigation after success

---

### Test Scenarios

#### Scenario 1: [Name] — PASS

**Given** [Precondition]  
**When** [Action]  
**Then** [Expected result]

---

#### Scenario 2: [Name] — FAIL (client validation)

**Given** [Precondition]  
**When** [Action]  
**Then** [Expected result — field errors displayed]

---

#### Scenario 3: [Name] — FAIL (server error)

**Given** [Precondition]  
**When** [Action]  
**Then** [Expected result — server errors mapped to fields]

---

### Checklist
- [ ] Code compiles without TypeScript errors (`npx tsc --noEmit`)
- [ ] Lint passes without errors (`npx expo lint`)
- [ ] All tests pass (`npx jest --ci`)
- [ ] Commit standards followed (type, scope, descriptive)
- [ ] API contract matches the implemented screen
- [ ] Documentation updated (`docs/modules/[module].md`)
- [ ] No debug code, `console.log`, or hardcoded credentials
- [ ] Components are reusable (Input, Button, etc. extracted)
- [ ] Error messages use Spanish (matching target audience)
- [ ] Loading states handled for async operations
- [ ] No breaking changes to existing screens or navigation

---

**Last updated**: June 5, 2026
