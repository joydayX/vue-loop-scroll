# 贡献指南

**中文** | [English](./CONTRIBUTING.md)

感谢您有兴趣为 Feutopia 做出贡献！在提交您的贡献之前，请阅读以下指南。

## 🔧 开发环境设置

### 1. 克隆仓库

```bash
git clone https://github.com/joydayX/vue-loop-scroll.git
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动开发服务器

```bash
pnpm dev
```

## 📝 Pull Request 规范

- 从 `main` 分支检出一个主题分支，并在该分支上进行开发
- 在 `lib` 文件夹中工作，不要在提交中包含 `dist` 目录
- 如果添加新功能：
  - 添加相应的测试用例
  - 提供添加此功能的充分理由
- 如果修复 bug：
  - 在 PR 中提供 bug 的详细描述
  - 添加适当的测试覆盖（如果适用）

## 🔍 代码风格

- 遵循 [Vue 风格指南](https://vuejs.org/style-guide/)
- 使用 TypeScript
- 运行 `pnpm lint` 并修复任何代码格式问题
- 运行 `pnpm test` 并确保所有测试通过

## 📦 提交规范

提交信息应该遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 仅文档更改
- `style`: 不影响代码含义的更改
- `refactor`: 既不修复 bug 也不添加新功能的代码更改
- `perf`: 提高性能的代码更改
- `test`: 添加缺失的测试
- `chore`: 构建过程或辅助工具的变动

示例：`feat: 添加新的 Button 组件`
