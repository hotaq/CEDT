## Context

The current `ez-git` application is a Tauri + Vue 3 desktop app with basic styling. The goal is to overhaul the user interface to match a modern, card-based aesthetic with soft shadows, rounded corners, and a more vibrant color palette, as established in the `proposal` and corresponding `specs`. The changes are primarily visual, focusing on `src/App.vue` and global styles.

## Goals / Non-Goals

**Goals:**
- Implement a centralized Vanilla CSS theme system using CSS custom variables for colors, spacing, typography, and border radii.
- Restructure `App.vue` to use a modern card-based layout, visually distinguishing the repository context from staging areas and actions.
- Update UI components (buttons, lists, inputs) to be softer, more inviting, and clearly distinguishable.

**Non-Goals:**
- Introducing a CSS framework like Tailwind CSS (which is avoided to maintain maximum flexibility and control using Vanilla CSS).
- Altering the underlying git integration logic (`src/api.ts` or the Rust backend).
- Adding complex animations or a dark mode toggle.

## Decisions

**1. Vanilla CSS with CSS Custom Properties for Design Tokens**
- *Rationale*: Avoids heavy framework dependencies while providing a strict, reusable design system. Using CSS variables defined in `:root` allows easy global updates to colors, spacing, and typography, perfectly supporting the `theme-system` capability requirement.
- *Alternatives considered*: Sass/SCSS (adds build overhead), Tailwind CSS (avoided per constraints).

**2. Component Layout Strategy**
- *Rationale*: We will use Flexbox and CSS Grid to structure the main `App.vue`. The layout will feature a prominent context header and a main content area organized into layered "cards" (`background-color: var(--surface-color)`, `border-radius: var(--radius-lg)`, `box-shadow: ...`).
- *Alternatives considered*: Keeping the flat layout and just changing colors (would not achieve the desired modern, dimensional aesthetic).

**3. Typography**
- *Rationale*: We will import a modern sans-serif font (e.g., 'Inter' or 'Outfit' from Google Fonts) to establish the premium feel requested in the `specs`, falling back to system fonts.

## Risks / Trade-offs

- **[Risk] Breaking existing layouts during the transition.**
  - *Mitigation*: We will carefully map existing functional areas (Status, Staging, Commit) to the new card layout, ensuring no functional elements are accidentally hidden.
- **[Risk] Inconsistent component styling without a framework.**
  - *Mitigation*: Establish standard CSS utility classes (e.g., `.btn-primary`, `.card`, `.input`) in a global `src/style.css` (or equivalent) that Vue components can easily adopt.
