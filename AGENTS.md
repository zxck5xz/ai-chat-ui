<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

## ESLint: Fix, Never Suppress

**Rule:** When ESLint reports an error or warning, fix the root cause in the code. Never use `eslint-disable` comments to silence issues.

### What NOT to do

```tsx
// ❌ BAD: Suppressing the lint rule
// eslint-disable-next-line react-hooks/set-state-in-effect
useEffect(() => {
  loadData();
}, [loadData]);
```

### How to fix common patterns

| ESLint Error                         | Root Cause                                                | Fix                                                                                                |
| ------------------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `react-hooks/set-state-in-effect`    | Calling setState inside `useEffect`                       | Split into separate effects; fetch data directly, not through wrapper functions that call setState |
| `react-hooks/exhaustive-deps`        | Missing or extra dependencies                             | Add missing deps, or restructure so the value doesn't need to be a dependency                      |
| `@typescript-eslint/no-explicit-any` | Using `any` type                                          | Replace with proper type, `unknown`, or a specific union                                           |
| `react-hooks/immutability`           | Accessing ref during render / variable before declaration | Move declaration above usage, or use `useRef` + `useEffect` pattern                                |
| `@typescript-eslint/no-unused-vars`  | Unused import/variable                                    | Remove it                                                                                          |

### Verification

After fixing ESLint issues:

1. Run `npx eslint .` — must show 0 errors
2. Run `npm run build` — must pass
3. Never commit with eslint-disable comments unless the rule is genuinely incorrect for the use case
