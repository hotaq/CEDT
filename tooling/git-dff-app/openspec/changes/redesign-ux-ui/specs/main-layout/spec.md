# Main Layout

## Overview
A fundamental visual restructuring of the core application view to clearly separate repository context from primary actions, utilizing a modern, card-based aesthetic.

## User Experience
- The primary interface will be divided into clear sections using distinct visual layers (cards with soft shadows).
- A top section/header will display the current repository context (e.g., repo name, current branch).
- The main content area will display the staging area and history in clean, bounded cards.
- Navigation and primary actions (Commit, Push, Pull) will be easily accessible, potentially utilizing floating action buttons or prominent rounded buttons at the bottom.

## Rules & Constraints
- The layout must remain responsive, adapting gracefully to different window sizes.
- The restructuring must not remove or hide existing functionality (status, staging, committing).
- The visual hierarchy must guide the user's eye naturally from context (top/left) to action (bottom/right).

## Out of Scope
- Changing the underlying git operations or how they function.
- Adding new functional workflows that don't already exist in the app.
