# Design System: Crop Management

Source: https://stitch.withgoogle.com/projects/8898422202104795737
Screen: 13fae35f23fa4c50854029b67af314e2

## 1. Visual Theme & Atmosphere
Grounded agricultural operations UI; calm, readable, balanced density. Follow the existing canvas rather than inventing a replacement layout. Exact screen assets are currently blocked by Google sign-in redirects.

## 2. Color Palette & Roles
Forest primary #154212; container #2d5a27; cream canvas #fff8f3; white surfaces #ffffff; charcoal ink #1e1b18; muted ink #42493e; border #c2c9bb. Preserve the canvas palette.

## 3. Typography Rules
The supplied canvas explicitly uses Inter. Preserve it to match the user's reference. Mobile heading 24px/32px, section heading 20px/28px, body 16px/24px, supporting text 14px/20px, metadata 12px/16px.

## 4. Component Stylings
44px minimum buttons, forest primary with white text. Persistent input labels. 8px control radii, 16px card radii, subtle green-tinted shadows. Render real saved seasons and retain existing crop creation and dashboard actions.

## 5. Layout Principles
16px mobile margins, 24px gutters, 4px spacing scale. No horizontal overflow or overlapping text. Current implementation applies the retrieved design-system tokens to the existing Crop Management composition. Exact screen composition still requires the exported HTML or screenshot for visual verification.

## 6. Motion & Interaction
Restrained transform/opacity feedback; respect reduced motion. Avoid animation that impairs field use.

## 7. Anti-Patterns
No fabricated season data, decorative emoji, neon glows, unnecessary new navigation, or guessed screen composition.

## Original Stitch Design System

---
name: Agricultural Operations Platform
colors:
  surface: '#fff8f3'
  surface-dim: '#dfd9d3'
  surface-bright: '#fff8f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#faf2ed'
  surface-container: '#f4ede7'
  surface-container-high: '#eee7e1'
  surface-container-highest: '#e8e1dc'
  on-surface: '#1e1b18'
  on-surface-variant: '#42493e'
  inverse-surface: '#33302c'
  inverse-on-surface: '#f7efea'
  outline: '#72796e'
  outline-variant: '#c2c9bb'
  surface-tint: '#3b6934'
  primary: '#154212'
  on-primary: '#ffffff'
  primary-container: '#2d5a27'
  on-primary-container: '#9dd090'
  inverse-primary: '#a1d494'
  secondary: '#8c4e2f'
  on-secondary: '#ffffff'
  secondary-container: '#feae88'
  on-secondary-container: '#793f21'
  tertiary: '#2d3e2c'
  on-tertiary: '#ffffff'
  tertiary-container: '#445542'
  on-tertiary-container: '#b5c9b1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bcf0ae'
  primary-fixed-dim: '#a1d494'
  on-primary-fixed: '#002201'
  on-primary-fixed-variant: '#23501e'
  secondary-fixed: '#ffdbcc'
  secondary-fixed-dim: '#ffb693'
  on-secondary-fixed: '#351000'
  on-secondary-fixed-variant: '#6f381a'
  tertiary-fixed: '#d4e8d0'
  tertiary-fixed-dim: '#b8ccb4'
  on-tertiary-fixed: '#0f1f10'
  on-tertiary-fixed-variant: '#3a4b39'
  background: '#fff8f3'
  on-background: '#1e1b18'
  surface-variant: '#e8e1dc'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is engineered for the modern agricultural sector, prioritizing high legibility, functional density, and an atmosphere of grounded reliability. The brand personality is professional and expert, moving away from "tech-first" aesthetics toward a "land-first" digital experience.

The design style is **Corporate / Modern** with a **Tactile** influence. It utilizes a clean, systematic layout common in high-end SaaS, but softens the digital edge with organic color tones and subtle elevation. The interface must evoke a sense of calm and control, even when displaying complex data sets related to crop yields, soil health, or fleet management.

- **Minimalism:** Use generous whitespace to prevent information overload.
- **Trustworthiness:** Lean on high-contrast typography and consistent alignment.
- **Utility:** Every element must serve a functional purpose; avoid purely decorative flourishes.

## Colors

The palette is rooted in the natural environment of the agricultural industry.

- **Primary (Deep Forest Green):** Used for key branding, primary call-to-action buttons, and active navigation states. It represents growth and stability.
- **Secondary (Earthy Terracotta):** Reserved for data visualization highlights, notifications that require attention without alarm, and interactive accents.
- **Background (Cream/Charcoal):** The light mode uses an off-white cream to reduce eye strain in outdoor sunlight. The dark mode uses a deep "Forest Charcoal" to maintain brand continuity and visual comfort in low-light environments.
- **Semantic Colors:** Success, Warning, and Error colors are slightly desaturated to harmonize with the earthy primary palette, ensuring they don't feel jarring against the natural tones.

## Typography

This design system utilizes **Inter** for its exceptional legibility at small sizes and its neutral, modern character. 

- **Scale:** A modular scale is used to ensure clear hierarchy in data-heavy views. 
- **Readability:** Line heights are slightly increased (1.5x for body text) to accommodate technical reading.
- **Labels:** Small labels use a medium or semi-bold weight with slight letter spacing to ensure they remain legible when used in data grids or as field captions.
- **Mobile:** Headlines automatically scale down on smaller viewports to maintain context without overwhelming the screen.

## Layout & Spacing

The layout follows a **Fluid Grid** model with fixed maximum widths for content containers to ensure readability on ultra-wide monitors.

- **Desktop (1440px+):** 12-column grid, 24px gutters, 40px side margins.
- **Tablet (768px - 1439px):** 8-column grid, 20px gutters, 24px side margins.
- **Mobile (Up to 767px):** 4-column grid, 16px gutters, 16px side margins.

A strict 4px spacing power-of-two scale is used for all internal component padding and margins to maintain rhythmic consistency. Generous vertical spacing is encouraged between sections to delineate different operational modules (e.g., separating "Weather Reports" from "Inventory Status").

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Ambient Shadows**.

- **Surface Levels:** 
  - Level 0: Background color (`#FAF9F6`).
  - Level 1: Cards and primary containers (White).
  - Level 2: Popovers, dropdowns, and modals (White with shadow).
- **Shadows:** Use extremely soft, diffused shadows with a slight tint of the Primary color to avoid a "dirty" gray look. 
  - *Standard Shadow:* `0px 4px 12px rgba(45, 90, 39, 0.08)`.
  - *High Elevation:* `0px 12px 24px rgba(45, 90, 39, 0.12)`.
- **Outlines:** All Level 1 containers feature a 1px border in a light warm-gray (`#E5E2DA`) to provide definition without the heaviness of a dark stroke.

## Shapes

The design system uses a **Rounded** shape language to feel approachable and modern.

- **Components:** Standard buttons, input fields, and small UI elements use a **0.5rem (8px)** radius.
- **Containers:** Dashboard cards and main content areas use **1rem (16px)** rounded corners.
- **Selection:** Active states in navigation or multi-select lists use a **0.25rem (4px)** radius to maintain a sharper, more precise feel.

## Components

- **Buttons:** Primary buttons use the Forest Green background with white text. Secondary buttons use a Terracotta outline with Terracotta text. Ghost buttons use Primary Green text with no background. All buttons have a minimum height of 44px for touch-friendliness in field environments.
- **Cards:** Cards are the primary vessel for data. They must include a 1px border and a subtle soft shadow. Padding within cards is fixed at 24px.
- **Input Fields:** Use a 1px border (`#D1CEC7`). On focus, the border thickens to 2px and changes to Primary Green. Labels are always persistent above the field.
- **Chips:** Used for filtering and status. Success chips use the Sage Green background with a dark green text. Warning/Error chips follow the same pattern with their respective semantic colors at 15% opacity for backgrounds.
- **Icons:** Use thin-stroke line icons (2px stroke width). Icons should be monochromatic (Neutral Dark Gray) unless they represent a specific status or action.
- **Data Grids:** High-density tables should use zebra-striping with a very faint cream tint and 12px vertical cell padding for legibility.


## Screenshot composition update
User supplied the Crop Management screenshot. Mobile crop picker uses three compact columns, a dark-green custom-crop action, and saved season cards with green top borders and full-width dashboard actions. Preserve readable font sizes and real season data; do not invent health or stage values absent from the backend.

## Crop Operations screen
Applied the user-supplied Rice Operations screenshot to CropDashboard: season header with Add Entry, horizontally scrollable operation tabs, Financial & Field Status in a two-by-two grid, proportional investment breakdown with linked rows, upcoming schedule and timeline log. All values come from saved season data. Harvest and return totals remain available after the main overview.

Confirmed source via Stitch MCP: Rice Operations - Crop Dashboard, screen 8736e82d3fd645ffb8b80441c0452e31. Its source asset downloads still redirect to Google sign-in. Screenshot-based overview now ends with Upcoming Schedule & Log; harvest/returns remain in their respective tabs.

## Main screen color confirmation
Canvas label: main screen. Screen title: Rice Operations - Compact Dashboard. Screen ID: 6f7361bc1aa34dc69ffc60f0a0b60758. Applied verified project namedColors to Crop Operations, replacing previous screenshot-estimated colors. Per-screen HTML still redirects to Google sign-in, so screen-specific overrides remain unverified.

## Screenshot takes precedence over project palette
The user comparison shows white page surfaces and neutral light-grey Financial & Field Status tiles. Removed the project palette override that introduced cream/pink surfaces. Final Crop Operations page is #ffffff; financial tiles #fafafa; Investment Phase uses a pale yellow background. Compact mobile tabs and financial typography follow the supplied screen.
