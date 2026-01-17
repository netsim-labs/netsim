# Contributing to NetSim Community Edition

First off, thank you for considering contributing to NetSim! It's people like you that make NetSim such a great tool for the networking community.

## 🚀 Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/netsim.git
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your fix or feature:
   ```bash
   git checkout -b feature/amazing-feature
   ```

## 🛠️ Coding Standards

To maintain high code quality, we follow these standards:

- **TypeScript**: All new code must be written in TypeScript with proper type definitions. Avoid using `any` unless absolutely necessary.
- **ESLint & Prettier**: Ensure your code passes linting checks. Run `npm run lint` before committing.
- **React Best Practices**: Use functional components, hooks, and keep components focused and reusable.
- **State Management**: Use Zustand for global state. Ensure state changes are predictable and well-documented.

## 📥 Pull Request Process

1. **Update documentation**: If you're adding a new feature or changing existing behavior, update the relevant documentation.
2. **Add tests**: New features should include unit or integration tests (using Vitest).
3. **Sync with main**: Ensure your branch is up-to-date with the `main` branch of the official repository.
4. **Submit the PR**: Provide a clear description of the changes and link any related issues.

## 🐛 Reporting Bugs

- Use the **GitHub Issues** tab to report bugs.
- Provide a clear title and description.
- Include steps to reproduce the issue.
- Mention your environment (Browser version, OS, etc.).

## 💡 Feature Requests

We love hearing new ideas! Please open an issue and tag it as a `feature request`. Explain the use case and how it benefits the community.

---

By contributing, you agree that your contributions will be licensed under the project's **AGPL-3.0 License**.
