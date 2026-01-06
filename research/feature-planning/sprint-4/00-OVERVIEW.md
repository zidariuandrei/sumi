# Sprint 4: Mobile Mastery (Accessibility & Usability)

**Goal:** Ensure Sumi feels like a native mobile app with fluid gestures, responsive design, and touch-first accessibility.

## 04A: Touch Gestures & Haptics
- **Swipe Navigation**: Horizontal swipes to turn pages (with momentum and rubber-banding).
- **Pinch-to-Zoom**: Fluid zooming for PDF and images.
- **Long-Press Menu**: Mobile-native text selection and context menus.
- **Haptic Feedback**: Subtle vibration on page turns, bookmarking, and long-press (via Tauri Haptics plugin).

## 04B: Adaptive & Responsive UI
- **Dynamic Chrome**: Header/Footer that auto-hides on scroll or tap, optimized for small screens.
- **Bottom Sheets**: Convert all side-drawers (TOC, Settings) to bottom sheets on mobile devices using `vaul-svelte` or standard shadcn patterns.
- **SafeArea Integration**: Ensure UI doesn't overlap with notches or home indicators.

## 04C: Mobile Accessibility
- **Screen Reader Optimization**: Proper ARIA roles and labels for all interactive elements.
- **Large Touch Targets**: Ensure all buttons meet the 44x44px minimum hit area.
- **High Contrast Themes**: Mobile-specific themes for outdoor reading (Sunlight mode).

## 04D: Performance & Battery
- **Asset Optimization**: Efficient cover caching to reduce CPU/Disk usage on mobile.
- **Background Throttling**: Pause heavy operations (like indexing) when the app is in the background.
