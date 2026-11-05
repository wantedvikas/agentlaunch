---
name: extend-design-tokens
description: Add or change a color, radius, shadow or motion token in the design system for both light and dark themes. Use instead of hard-coding colors or one-off styles.
---

Follow **AGENTS.md → Recipe 3: Extend the design tokens**. Always:

- Define the variable in both `:root` and `.dark` in `src/app/globals.css`, and expose it in `@theme inline`
- Use it through a component variant (`cva`), not scattered utility classes
- Keep text contrast at 4.5:1 or better in both themes; `pnpm test:e2e` runs the axe check
