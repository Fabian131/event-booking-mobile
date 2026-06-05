# Commit Standards

Guide for **Conventional Commits** to maintain a clean, structured, and traceable Git history.

> **IMPORTANT**: All commits must be in **ENGLISH**. The ticket prefix is **EBM** (Event Booking Mobile).

---

## Why Conventional Commits

- **Readable history** — Understand what changed and why
- **Traceability** — Link commits to project tickets (EBM-XXX)
- **Semantic versioning** — Automatically determine patch, minor, or major
- **Collaboration** — Everyone follows the same format

---

## Format

```
<type>(<scope>): <subject>
```

**Fields:**
- **type**: Type of change (see table below)
- **scope** (optional): Module or affected area
- **subject**: Short description (< 50 characters, imperative, lowercase, no period)

### Example

```
feat(auth): add JWT token generation
```

With detailed description (in the commit body):

```
feat(auth): add JWT token generation

Implements JWT Bearer token generation using HMAC-SHA256.
Tokens include accountId, email, and accountType claims.
Expiration is configurable via appsettings.json.

Refs: EBM-003
```

---

## Commit Types

| Type | Description | When to Use | Example |
|------|-------------|-------------|---------|
| **feat** | New functionality | Add a new feature | `feat(auth): add register endpoint` |
| **fix** | Bug fix | Solve an error | `fix(reviews): fix rating calculation` |
| **docs** | Documentation | Only docs, README, comments | `docs(modules): document auth module` |
| **style** | Code formatting | Changes that don't affect functionality | `style(controllers): apply consistent formatting` |
| **refactor** | Refactoring | Change code without adding features or fixing bugs | `refactor(services): extract validation to helper` |
| **perf** | Performance improvement | Optimizations | `perf(repositories): add AsNoTracking to GetAllAsync` |
| **test** | Tests | Add or modify tests | `test(auth): add login validation tests` |
| **chore** | Maintenance tasks | Dependencies, configs, build | `chore(deps): update Npgsql to 8.0.11` |
| **build** | Build system | Docker, csproj, CI/CD | `build(docker): update PostGIS image` |
| **ci** | Continuous integration | Pipelines, GitHub Actions | `ci: add build validation workflow` |
| **revert** | Revert commit | Undo a previous commit | `revert: revert feat(auth) due to regression` |

---

## Suggested Scopes

**By Module (18 modules):**
- `auth` — Authentication and JWT (Account)
- `users` — User management
- `businesses` — Business profiles
- `categories` — Menu categories
- `comments` — Feed comments
- `dice` — Dice promotions
- `diceroll` — Dice roll history
- `feed` — Social feed items
- `followers` — Business followers
- `geo` — Geography (Province, Canton, District)
- `likes` — Feed likes
- `map` — Spatial queries (PostGIS)
- `notifications` — Push notifications
- `photos` — Business photos
- `product-reviews` — Product ratings
- `products` — Menu products
- `promotions` — Active promotions
- `reviews` — Business reviews

**By Technical Area:**
- `database` — Migrations, DbContext, Configurations
- `api` — Endpoints, routing, Controllers
- `config` — Configuration files (.env, appsettings)
- `docker` — Docker configuration
- `deps` — NuGet dependencies
- `middleware` — Middleware pipeline
- `security` — Security, authorization, JWT
- `repositories` — Data access layer
- `services` — Business logic layer
- `dtos` — Data Transfer Objects
- `mappers` — Entity-DTO conversions
- `validators` — FluentValidation rules
- `docs` — Documentation files
- `migrations` — EF Core migration files

---

## Workflow with GitHub Desktop

### 1. Create Branch

Format: `feature/EBM-XXX-short-description`

Examples:
```
feature/EBM-001-user-registration
feature/EBM-003-jwt-login
fix/EBM-015-token-expiration
docs/EBM-020-api-reference
```

### 2. Staging

- Select ONLY the files related to your change
- One commit = one logical change
- DO NOT mix unrelated changes in the same commit

### 3. Write Commit

**Summary (required):**
```
feat(auth): add register endpoint
```

**Description (optional):**
```
Implements POST /api/auth/register with:
- Account + User atomic creation (IDbContextTransaction)
- BCrypt password hashing
- JWT token generation
- Email uniqueness validation

Refs: EBM-001
```

### 4. Create Pull Request

PR title:
```
[EBM-001] feat(auth): add register endpoint
```

Use the template defined in `docs/04-development/pr-template.md`.

---

## Commits to Avoid

```bash
# Too generic
fix bug
update
changes

# In Spanish
feat(auth): agregar registro de usuario

# Without type
add reservation by date

# Too long
add new endpoint to fetch all businesses filtered by category ordered by rating

# Mixed changes
fix(auth): fix login and feat(businesses): add create endpoint
```

---

## Semantic Versioning

| Commit Type | Version Bump | Example |
|-------------|-------------|---------|
| `fix` | PATCH (0.0.X) | 1.0.0 -> 1.0.1 |
| `feat` | MINOR (0.X.0) | 1.0.0 -> 1.1.0 |
| `BREAKING CHANGE` | MAJOR (X.0.0) | 1.0.0 -> 2.0.0 |
| `docs`, `style`, `test`, `chore` | No change | — |

---

## Checklist Before Committing

- [ ] Written in ENGLISH
- [ ] Contains ONE single logical change
- [ ] Uses a valid type (feat, fix, docs, etc.)
- [ ] Summary is clear and concise (< 50 chars)
- [ ] Uses imperative mode ("add" not "added")
- [ ] Includes scope if the affected module is clear
- [ ] Includes LVT ticket reference if applicable
- [ ] Code compiles (`dotnet build`)
- [ ] No real credentials in committed files

---

## Common Vocabulary

| Spanish | English | Example |
|---------|---------|---------|
| agregar | add | `add validation` |
| corregir | fix | `fix login error` |
| actualizar | update | `update dependencies` |
| eliminar | remove | `remove unused code` |
| mejorar | improve | `improve performance` |
| refactorizar | refactor | `refactor service` |
| implementar | implement | `implement feature` |
| crear | create | `create migration` |
| optimizar | optimize | `optimize query` |

---

## References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)

---

**Last updated**: June 5, 2026
