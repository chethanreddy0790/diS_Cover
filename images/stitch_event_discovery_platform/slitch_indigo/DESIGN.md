# Design System Specification: Editorial Academic Fluidity

## 1. Overview & Creative North Star: "The Digital Sanctuary"
This design system moves away from the rigid, "dashboard-heavy" aesthetics typical of EdTech. Our Creative North Star is **The Digital Sanctuary**. We aim to create a space that feels academically rigorous yet emotionally supportive—a hybrid of a high-end editorial magazine and a serene study lounge. 

To break the "template" look, we employ **Intentional Asymmetry** and **Tonal Depth**. We prioritize breathing room over information density. Key information shouldn't just be "placed" on the screen; it should be curated. We achieve this by using overlapping elements (e.g., a card bleeding slightly over a header boundary) and a typography scale that favors dramatic contrast between massive Display styles and precise, legible body copy.

---

## 2. Colors: Tonal Architecture
We utilize a sophisticated Material 3-based palette to ensure the interface feels "expensive" and custom.

### The "No-Line" Rule
**Standard 1px borders are strictly prohibited for sectioning.** We do not draw boxes around content. Boundaries must be defined through background color shifts. If a sidebar needs to be separated from the main feed, use `surface_container_low` against a `background` floor. This creates a "soft-edge" UI that reduces cognitive load and feels more organic.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of fine paper. 
- **Base Layer:** `background` (#fbf8ff)
- **Secondary Zone:** `surface_container_low` (#f4f2ff)
- **Active Component:** `surface_container_highest` (#e0e0fc)
- **Floating/Action Layer:** `surface_container_lowest` (#ffffff) with ambient shadows.

### The "Glass & Gradient" Rule
To inject "soul" into the student experience, use Glassmorphism for floating navigation bars or overlay modals. 
- **Effect:** `surface` color at 70% opacity + 20px Backdrop Blur.
- **Signature Gradients:** Use a subtle linear gradient (45°) from `primary` (#4143d5) to `primary_container` (#5b5fef) for Hero CTAs and progress indicators to avoid a flat, "Bootstrap" appearance.

---

## 3. Typography: The Editorial Voice
We pair **Plus Jakarta Sans** (Headlines) with **Be Vietnam Pro** (Body) to create a balance between modern geometric authority and soft, approachable readability.

| Level | Font Family | Size | Character |
| :--- | :--- | :--- | :--- |
| **Display LG** | Plus Jakarta Sans | 3.5rem | Dramatic, used for welcoming "Hero" moments. |
| **Headline MD** | Plus Jakarta Sans | 1.75rem | Section anchors. Bold and confident. |
| **Title LG** | Be Vietnam Pro | 1.375rem | Card headers. Professional and clear. |
| **Body LG** | Be Vietnam Pro | 1rem | The workhorse. Generous line-height (1.6). |
| **Label MD** | Be Vietnam Pro | 0.75rem | All-caps with 5% letter spacing for metadata. |

*Note: Use `on_surface_variant` (#464555) for body text to reduce harsh contrast, maintaining the "Soft Minimalism" ethos.*

---

## 4. Elevation & Depth: Tonal Layering
We do not use shadows to show "importance"—we use them to show "interaction."

- **The Layering Principle:** Place a `surface_container_lowest` card on a `surface_container_low` section. The change in hex code creates a natural lift that feels integrated into the architecture.
- **Ambient Shadows:** For "elevated" states (like a dragged card or a floating action button), use a multi-layered shadow:
  - `box-shadow: 0 12px 32px -8px rgba(24, 26, 46, 0.08);`
  - The shadow color is a tint of `on_surface`, never pure black.
- **The "Ghost Border" Fallback:** If accessibility requires a stroke, use `outline_variant` at 20% opacity. It should be felt, not seen.

---

## 5. Components: Soft & Purposeful

### Buttons
- **Primary:** `primary` background with `on_primary` text. Border-radius: `1.5rem` (md). No shadow in rest state; "Glow" shadow on hover using a 15% opacity primary color.
- **Secondary:** `secondary_container` background with `on_secondary_container` text. This "Mint" tone should be used for positive actions like "Submit" or "Complete."

### Input Fields
- **Styling:** Use `surface_container_high` backgrounds. Do not use an outline in the rest state. Upon focus, transition to a `primary` 2px bottom-border only, or a subtle `primary` glow. 
- **Corners:** Rounded to `0.5rem` (sm) to maintain a distinct "functional" feel compared to the softer `1rem` (default) content cards.

### Cards & Lists
- **The "No Divider" Rule:** Forbid 1px horizontal lines between list items. Use 16px of vertical whitespace or alternating `surface_container` tints to separate tasks or grades.
- **Radius:** Standardize on `1rem` (16px) for inner cards and `1.5rem` (24px) for major layout containers.

### Academic-Specific Components
- **Study Pulse:** A custom progress component using a gradient of `tertiary` (#a62a30) to `primary` to show student engagement levels.
- **Focus Mode Cards:** Large, `xl` (3rem) rounded containers that take over the viewport, using `surface_bright` to eliminate distractions.

---

## 6. Do’s and Don’ts

### Do:
- **Do** use whitespace as a functional tool. If in doubt, add 8px more padding.
- **Do** use `tertiary` (Coral) sparingly for "Momentum" moments—badges, streaks, or urgent notifications.
- **Do** ensure all interactive elements have a minimum tap target of 48x48dp, even if the visual asset is smaller.

### Don't:
- **Don’t** use pure #000000 for text. It breaks the "Sanctuary" vibe. Use `on_surface`.
- **Don’t** use "Drop Shadows" on flat text. Let the typography scale do the work.
- **Don’t** crowd the edges of the screen. Maintain a minimum of 24px (3 units of the 8pt grid) of margin on all mobile screens.
- **Don’t** use square corners. Ever. Even for images—apply the `DEFAULT` (1rem) radius to all media.