# Design System Document: The Luminous Discovery System

## 1. Overview & Creative North Star: "The Digital Curator"

This design system is built to transform the inter-college event discovery experience from a chaotic bulletin board into a high-end, curated gallery. Our Creative North Star is **"The Digital Curator"**—a philosophy that treats every event as a piece of art and every user interaction as an intentional gallery walkthrough.

To move beyond the "template" look common in campus apps, we embrace **Sophisticated Airyism**. This means rejecting rigid, boxed-in grids in favor of intentional asymmetry, generous white space, and "floating" elements. We break the grid by allowing hero images to bleed into margins and using overlapping typography to create a sense of three-dimensional depth. The goal is a light theme that feels like a premium physical magazine—tactile, breathable, and authoritative.

---

## 2. Colors & Surface Philosophy

The palette is rooted in a crisp, high-fidelity base, utilizing tonal shifts rather than lines to define structure.

### The Palette (Material Design 3 Logic)
*   **Primary (`#284ade`):** Our "Action Anchor." Used for high-priority pathfinding.
*   **Secondary (`#0058be`):** Used for interactive supporting elements.
*   **Surface Tiers:**
    *   `surface-container-lowest`: `#ffffff` (The pure white "Hero" card)
    *   `surface`: `#f7f9fb` (The main canvas)
    *   `surface-container-low`: `#f2f4f6` (Subtle nesting)
    *   `surface-container-highest`: `#e0e3e5` (Strongest structural contrast)

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through background color shifts. To separate the header from the body, transition from `surface` to `surface-container-low`. To highlight a card, place a `surface-container-lowest` card on a `surface` background.

### The "Glass & Gradient" Rule
To inject "soul" into the UI, main CTAs must utilize a smooth linear gradient: `primary` (#284ade) to `primary_container` (#4766f8) at a 135° angle. Floating navigation bars or modal headers must use **Glassmorphism**: a semi-transparent `surface` color with a `24px` backdrop-blur to allow the vibrant event imagery to bleed through softly.

---

## 3. Typography: The Editorial Voice

We use a dual-typeface system to balance personality with extreme legibility.

*   **Display & Headlines (Plus Jakarta Sans):** Our "Editorial" voice. Used for event titles and page headers. These should be set with tight letter-spacing (-0.02em) to feel premium and compact.
*   **Body & Labels (Manrope):** Our "Functional" voice. A geometric sans-serif that ensures high readability for event descriptions and metadata.

**The Hierarchy of Intent:**
*   `display-lg` (3.5rem): Reserved for "Moment of Arrival" headers.
*   `title-md` (1.125rem): The workhorse for card titles and section sub-headers.
*   `label-sm` (0.6875rem): Used for "Overlines" (tiny text above headlines) to categorize events (e.g., "WORKSHOP" or "FESTIVAL").

---

## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows are largely replaced by **Tonal Layering**. We communicate "upward" movement by shifting toward pure white.

*   **The Layering Principle:** Place a `surface-container-lowest` (#ffffff) object on a `surface-container-low` (#f2f4f6) background to create a "lifted" feel.
*   **Ambient Shadows:** For floating elements (e.g., FABs or active Modals), use "Cloud Shadows":
    *   `X: 0, Y: 12, Blur: 32, Spread: 0`
    *   Color: `on-surface` (#191c1e) at **6% opacity**. This mimics natural light rather than digital "glow."
*   **The Ghost Border Fallback:** If accessibility requires a border (e.g., in high-glare environments), use `outline-variant` at **15% opacity**. Never use 100% opaque lines.

---

## 5. Component Signature Styles

### Buttons
*   **Primary:** Rounded-xl (3rem), Primary-to-Primary-Container gradient, white text. No shadow—use tonal contrast.
*   **Tertiary:** No background, `primary` text. Used for "Cancel" or "Back" actions to minimize visual noise.

### Cards & Event Lists
*   **The "No-Divider" Mandate:** Forbid the use of line dividers between list items. Use `16px` of vertical whitespace or a subtle shift from `surface` to `surface-container-low` on hover.
*   **Visual Treatment:** Cards should use `rounded-md` (1.5rem) and feature a high-aspect-ratio image at the top that bleeds to the edges of the card container.

### Input Fields
*   **State:** Default state uses `surface-container-highest` as a subtle background fill. 
*   **Focus:** Transition the background to `surface-container-lowest` and add a 2px `primary` ghost-border (20% opacity).

### Specialized Component: The "Discovery Chip"
Used for filtering event categories.
*   **Unselected:** `surface-container-low` background, `on-surface-variant` text.
*   **Selected:** `primary` background, `on-primary` text, with a subtle `primary_fixed` glow.

---

## 6. Do’s and Don'ts

### Do
*   **Do** use asymmetrical margins (e.g., 24px on the left, 32px on the right) for editorial layouts.
*   **Do** prioritize "Breathing Room"—if you think there is enough padding, add 8px more.
*   **Do** use backdrop-blur on all sticky headers to maintain a sense of depth.

### Don’t
*   **Don't** use pure black (#000000) for text. Always use `on-surface` (#191c1e).
*   **Don't** use standard 4px or 8px corners. The minimum corner radius is `DEFAULT` (1rem / 16px).
*   **Don't** use shadows to define cards; use the shift from `surface` to `surface-container-lowest`.
*   **Don't** ever use a 1px solid line to separate content. Let the whitespace do the work.

---
*Note to Junior Designers: This system is not a set of constraints, but a foundation for elegance. When in doubt, prioritize the "feel" of a high-end physical space over the "logic" of a standard web grid.*