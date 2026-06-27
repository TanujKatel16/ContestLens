# Contributing to ContestLens

Thanks for your interest in contributing! Here's how to get started.

## Development setup

```bash
git clone <your-fork>
cd contestlens
npm install
npm run dev
```

## Folder conventions

| Folder | What goes here |
|--------|---------------|
| `src/lib/` | Pure TypeScript logic with zero React dependency |
| `src/components/` | React components — one per file, named export |
| `src/hooks/` | Custom React hooks — prefixed with `use` |
| `src/types/` | Shared TypeScript interfaces and types only |
| `src/styles/` | CSS entry point(s) for Tailwind |

## Pull request checklist

- [ ] `npm run type-check` passes with zero errors
- [ ] New logic lives in `src/lib/`, not inside components
- [ ] No `any` types without a `// @ts-ignore` comment explaining why
- [ ] Component files export a single default component
- [ ] Commit messages follow: `type(scope): description`

## Commit types

`feat` · `fix` · `refactor` · `chore` · `docs` · `style` · `test`

## License

By contributing you agree that your work is licensed under the project's MIT license.
