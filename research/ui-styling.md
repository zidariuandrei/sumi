# UI & Styling Knowledge Base

## Tailwind CSS v4

### Key Changes
- **Zero Configuration:** No `tailwind.config.js` needed by default. Configuration happens in CSS.
- **Vite Plugin:** Powered by `@tailwindcss/vite` for improved performance.
- **CSS-First Config:**
  ```css
  @import "tailwindcss";
  @theme {
    --color-primary: #3b82f6;
    --font-sans: "Inter", sans-serif;
  }
  ```

### Usage
- Just write standard Tailwind classes.
- The JIT engine is now the only engine and is integrated directly into the build tool.

## shadcn-svelte

### Philosophy
- **Not a Library:** It is a collection of re-usable components that you copy and paste into your apps.
- **Accessible:** Built on top of `bits-ui` (headless accessible components).
- **Customizable:** You own the code in `src/lib/components/ui`.

### Workflow
1. **Add Component:** `bun x shadcn-svelte@latest add [component-name]`
   - Example: `bun x shadcn-svelte@latest add button card`
2. **Import:** `import { Button } from "$lib/components/ui/button";`
3. **Modify:** Edit the component file in `$lib/components/ui` directly to change styles or behavior.

## Rules & Conventions
1. **Theming:** Use CSS variables defined in `src/app.css` for global theming (colors, radius). This allows runtime theme switching.
2. **Tailwind Merge:** Use `cn()` utility (provided by shadcn) to merge custom classes with default component classes safely.
   ```typescript
   class={cn("default-class", className)}
   ```
3. **Lucide Icons:** Use `lucide-svelte` for icons.
4. **Mobile First:** Always design with `sm:` `md:` `lg:` breakpoints, keeping mobile usage (E-reader) as the priority.
