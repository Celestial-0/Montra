# Montra

> **Sovereign Local-First Personal Financial Workspace**
>
> *The application stores financial facts; the user defines what those facts mean.*

---

## Quick Start

### Prerequisites
- [Bun](https://bun.sh/) (or Node.js 20+)
- [Expo Go](https://expo.dev/go) or an Android / iOS simulator

### Installation & Run

```bash
# 1. Install dependencies
bun install

# 2. Start the development server
bun dev
```

- Press `a` to open on Android emulator
- Press `i` to open on iOS simulator
- Scan the terminal QR code with **Expo Go** to test on a physical device

---

## Core Architecture & Features

- **Local-First & Offline-Ready**: Fast SQLite persistence via `expo-sqlite` and `drizzle-orm`. Zero mandatory cloud dependencies.
- **Hexagonal Architecture (Ports & Adapters)**: Clean domain boundaries decoupling business logic from UI frameworks and storage.
- **CQRS-Lite**: Distinct state-mutating commands and optimized read queries.
- **Pure OKLCH Design System**: Perceptually uniform, accessible financial color palette (Obsidian Charcoal, Deep Forest Green, Warm Ivory, and Soft Fog Gray).
- **Telegram Glass Floating Navbar**: Native `expo-blur` hardware-accelerated frosted glass dock with fluid Reanimated spring micro-interactions.
- **Interactive Analytics & Donut Hero**: Vector-based spending breakdowns, budget health progress, and multi-account transfers.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 57 (Managed Workflow, React Native 0.86) |
| Language | TypeScript 6.x (Strict Mode) |
| Navigation | Expo Router v5 |
| Styling | Uniwind (Tailwind CSS v4 for React Native) |
| Local Database | expo-sqlite + Drizzle ORM |
| Query Layer | TanStack React Query v5 |
| Animations | react-native-reanimated |
| Blur & Glass | expo-blur |
| Icons | lucide-react-native |

---

## Author & Developer

**Yash Kumar Singh**
- Website: [celestial-0.github.io](https://celestial-0.github.io/)
- GitHub: [@Celestial-0](https://github.com/Celestial-0)
- LinkedIn: [in/celestial0](https://linkedin.com/in/celestial0)
- Email: [yashkumarsingh.work@gmail.com](mailto:yashkumarsingh.work@gmail.com)

---

## License

This project is licensed under the terms of the [MIT License](LICENSE.md).
