# Changelog

All notable changes to **Montra** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-15

### Added
- **Hexagonal Domain Layer**:
  - Implemented 7 bounded contexts: Accounts, Transactions, Budgets, Categories & Tags, Views, Rules, and Data Ingestion.
  - Port & Adapter architecture with pure domain entities, invariants, and typed Result monads (`Result<T, DomainError>`).
  - Strict integer minor unit monetary arithmetic via `dinero.js` and time-ordered RFC 9562-compliant UUID v7 identifiers.
- **Local-First SQLite Persistence**:
  - Integrated `expo-sqlite` and `drizzle-orm` repositories with migration runner and seed data.
  - Multi-account double-entry transfer support and deterministic deduplication on CSV statement import.
- **Pure OKLCH Design System**:
  - 100% OKLCH trust palette featuring Obsidian Charcoal, Sovereign Deep Forest Green, Warm Ivory, and Soft Fog Gray.
  - Dynamic runtime color parsing via `lib/oklch.ts` for native React Native bridges and SVG paths.
- **Telegram Glass Floating Navbar**:
  - Floating island dock elevated with native `expo-blur` cross-platform background blur.
  - Physics-based sliding pill glider powered by `react-native-reanimated` with symmetrical cell alignment and tactile haptics.
- **Interactive Home Dashboard**:
  - Mobbin-inspired vector Spending/Income donut chart hero with floating center tooltip and seamless mode switching.
  - Net worth summary, budget pulse health card, multi-color semantic quick actions, and recent activity feed.
- **UI Hardening & Polish**:
  - Pulsing loading skeletons, empty state illustrations, and keyboard-avoiding modal dialogs.
