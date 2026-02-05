# Authentication System Documentation

## Overview

The authentication system in Oase has been completely redesigned to provide a premium, modern user experience. It features a persistent **Sliding Overlay** layout for desktop and a **Responsive, Interactive** layout for mobile devices.

## 1. Desktop Experience (Sliding Overlay)

On screens wider than `768px`, the login and register forms are presented side-by-side within a single card utilizing a persistent blue overlay.

### Key Features
-   **Persistent Layout**: The layout is managed by `src/app/(auth)/layout.tsx`, ensuring state is preserved during transitions.
-   **Sliding Animation**:
    -   Clicking "Sign Up" or "Sign In" triggers a smooth sliding animation (`0.8s ease-in-out`).
    -   **Elastic Effect**: The overlay expands to 100% width at the midpoint of the animation before shrinking to the other side, creating a "full-wipe" effect.
-   **Curved Design**: The overlay features dynamic `border-radius` changes (curving inward/outward) depending on its position (Left vs. Right).

### Technical Implementation
-   **CSS Keyframes**: Defined in `globals.css` as `show-register` and `show-login`.
-   **State Management**: Uses Next.js `usePathname` to detect the current route and apply the appropriate classes (e.g., `.container-right-panel-active`).

## 2. Mobile Experience (Responsive)

On screens narrower than `768px`, the layout automatically adapts to a cleaner, vertical stack.

### Key Features
-   **Hidden Overlay**: The blue sliding overlay is hidden (`display: none`) to conserve screen space.
-   **Centered Form**: The active form (Login or Register) is centered within the white card.
-   **Bi-Directional Page Transitions**:
    -   **Login -> Register**: The new page slides **UP** from the bottom.
    -   **Register -> Login**: The new page slides **DOWN** from the top.
    -   Powered by **Framer Motion** (`AnimatePresence`).
-   **Navigation Links**: Mobile-exclusive links ("Don't have an account? Sign Up") appear at the bottom of the forms to allow navigation without the overlay buttons.

### Technical Implementation
-   **Media Queries**: `globals.css` handles the hiding of the overlay and adjustment of container width.
-   **Framer Motion**: `src/app/(auth)/layout.tsx` uses `AnimatePresence` with custom variants (`enter`, `center`, `exit`) based on the transition direction.

## 3. Styling Principles

-   **Inputs**: Flat design (`bg-slate-100`, `border-none`) for a clean look.
-   **Buttons**: Uppercase, pill-shaped (`rounded-full`), and bold tracking.
-   **Colors**: Primary Blue (`bg-primary-600` / `#0ea5e9`) consistent with the brand.
