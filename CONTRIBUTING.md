# Contributing to Montra

Thank you for your interest in contributing to **Montra: Sovereign Local-First Personal Financial Workspace**!

---

## Development Setup

1. **Prerequisites**:
   - [Bun](https://bun.sh/) (preferred) or Node.js 20+
   - [Expo Go](https://expo.dev/go) or an iOS Simulator / Android Emulator

2. **Clone & Install**:
   ```bash
   git clone <repository-url>
   cd montra
   bun install
   ```

3. **Start Development Server**:
   ```bash
   bun dev
   ```

4. **Verify TypeScript Strictness**:
   ```bash
   bun x tsc --noEmit
   ```

---

## Architectural Guardrails & Invariants

When submitting changes, please ensure your code complies with the project's architectural rules:

1. **Hexagonal Architecture (Ports & Adapters)**:
   - The domain layer (`domain/`) must remain 100% independent of UI frameworks, SQLite drivers, HTTP clients, and React Native code.
   - External dependencies must be injected via abstract ports and repository interfaces.

2. **Local-First & Offline Resilience**:
   - The local SQLite database (`expo-sqlite` + `drizzle-orm`) is the primary source of truth.
   - Core operations must never require live network connectivity.

3. **Pure OKLCH Color Tokens**:
   - All colors must be declared in pure OKLCH strings (`oklch(L C H)`). Never commit hardcoded hex or RGB colors.

4. **CQRS-Lite**:
   - Clearly separate state-changing Commands (which enforce domain invariants) from read-only Queries.

5. **Package Management**:
   - Always use `bun` as the package runner and manager (`bun add`, `bun run`).

---

## Branching & Pull Requests

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. Format code and verify types before opening a PR:
   ```bash
   bun x prettier --write .
   bun x tsc --noEmit
   ```

3. Open a Pull Request with a clear summary of your changes and any testing performed.
