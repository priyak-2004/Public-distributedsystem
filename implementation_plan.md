# Implementation Plan - Upgrade Frontend UI (Dark Mode, A11Y, i18n)

**Objective**: Upgrade the government-grade frontend to support Dark Mode, Accessibility (A11Y), and Multi-language support (English, Tamil, Hindi) while maintaining offline capability and existing features.

## Part 1: Dark Mode 🌙
**Goal**: Native dark mode using Tailwind CSS with persistence.

### 1.1 Foundation
- **[NEW] `src/context/ThemeContext.js`**: 
    - Manage `darkMode` state.
    - Persist to `localStorage`.
    - Toggle `.dark` class on `document.documentElement`.
- **[MODIFY] `tailwind.config.js`**: Enable `darkMode: 'class'`.
- **[MODIFY] `src/index.css`**: Define CSS variables for base colors if needed, or rely on Tailwind's `dark:` classes.

### 1.2 UI Components
- **Navbar**: Add Toggle Button (Enter/Space support).
- **Cards/Forms**: Ensure `bg-white dark:bg-slate-800` and `text-gray-900 dark:text-white`.
- **Inputs/Tables**: Update borders and backgrounds for contrast.

## Part 2: Accessibility (A11Y) ♿
**Goal**: WCAG AA Compliance.

### 2.1 Enhancements
- **Keyboard Nav**: Ensure all interactive elements are focusable (`tabIndex`, `onKeyDown`).
- **ARIA Labels**: Add `aria-label` to iconic buttons (Theme Toggle, Language Selector, QR Scan).
- **Contrast**: Verify colors (e.g., Risk Badges) in both modes.
- **Roles**: Use `role="alert"` for form errors/success messages.

## Part 3: Multi-language Support 🌐
**Goal**: English, Tamil, Hindi support without external APIs.

### 3.1 Foundation
- **[NEW] `src/context/translations.js`**: Dictionary containing `en`, `ta`, `hi` mappings for all UI text.
- **[NEW] `src/context/LanguageContext.js`**:
    - Manage `language` state ('en', 'ta', 'hi').
    - Provide `t(key)` function.
    - Persist to `localStorage`.

### 3.2 Integration
- **Navbar**: Add Dropdown for Language Selection.
- **Components**: Replace hardcoded text with `t('key')`.
- **PDF Generation**: Pass translated strings to `pdfGenerator.js` logic (requires update to `TransactionCard` and `VerifyEventComponent` to pass correct strings).

## Execution Steps

### Step 1: Core Setup
1.  Create `ThemeContext.js` & `LanguageContext.js`.
2.  Create `translations.js` with provided dictionaries.
3.  Update `App.js` to wrap providers.
4.  Update `tailwind.config.js`.

### Step 2: Component Implementation
5.  **Navbar.js**: Add toggles with A11Y attributes.
6.  **EventForm.js**: Apply `t()` and dark mode styles.
7.  **EventTimeline.js**: Update list/card rendering.
8.  **TransactionCard.js**: Localize content & PDF handling.
9.  **VerifyEventComponent.js**: Localize verification flow.
10. **PDSDashboard.js**: Localize charts/stats.
11. **SystemStatus.js**: Dark mode adaption.
12. **StatusBadge.js**: Localize risk labels.

### Step 3: Verification
- Manual test of language switching.
- Manual test of dark mode toggle.
- Keyboard navigation test (Tab through navbar/form).
