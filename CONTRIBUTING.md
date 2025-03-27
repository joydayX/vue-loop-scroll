# Contributing Guide

**English** | [中文](./CONTRIBUTING-CN.md)

Thank you for being interested in contributing to `vue-loop-scroll`!Before submitting your contribution,please read through the following guide.

## 🔧 Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/joydayX/vue-loop-scroll.git
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Start development server

```bash
pnpm dev
```

## 📝 Pull Request Guidelines

- Checkout a topic branch from `main` branch and merge back against that branch.
- Work in the `lib` folder and DO NOT check in `dist` in the commits.
- If adding a new feature:
  - Add accompanying test case
  - Provide a convincing reason to add this feature
- If fixing a bug:
  - Provide a detailed description of the bug in the PR
  - Add appropriate test coverage if applicable

## 🔍 Code Style

- Follow the [Vue Style Guide](https://vuejs.org/style-guide/)
- Use TypeScript
- Run `pnpm lint` and fix any linting errors
- Run `pnpm test` and ensure all tests pass

## 📦 Commit Guidelines

Commit messages should follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Code change that improves performance
- `test`: Adding missing tests
- `chore`: Changes to the build process or auxiliary tools

Example: `feat: add new Button component`
