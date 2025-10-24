# ngawi-apps-dashboard Frontend Guideline Document

This document outlines the frontend architecture, design principles, styling, component organization, state management, routing, performance strategies, and testing approach for the **ngawi-apps-dashboard** project. It is written in everyday language so that anyone—technical or not—can understand how the frontend is built and maintained.

## 1. Frontend Architecture

**Framework and Libraries**
- **Next.js (App Router)**: Provides file-based routing, server components, client components, and API routes in a single framework.
- **TypeScript**: Enforces type safety across UI code, server actions, and database interactions.
- **shadcn/ui**: A set of prebuilt React components (Tables, Forms, Dialogs, Cards) for rapid UI development.
- **Tailwind CSS**: Utility-first styling for a consistent and responsive look.
- **Better Auth**: Handles user sign-up, sign-in, and session management.
- **Drizzle ORM & PostgreSQL**: Type-safe database layer for modeling tables and performing CRUD operations.

**Scalability, Maintainability, Performance**
- **File-Based Routing** scales naturally as new pages go into `/app`.
- **Server vs. Client Components**: Heavy data work happens on the server, while interactive bits live in client components—this split improves load times and reduces bundle size.
- **Type Safety**: Catch errors at compile time rather than runtime.
- **Clear Folder Structure** separates UI (`/components`), pages (`/app`), database schemas (`/db`), and business logic (`/lib`).

## 2. Design Principles

**Key Principles**
- **Usability**: Interfaces must be straightforward—forms should validate in real time, tables need easy sorting/filtering, and workflows should minimize clicks.
- **Accessibility**: All interactive elements use proper ARIA labels, semantic HTML, keyboard navigation, and sufficient color contrast for readability.
- **Responsiveness**: Layouts are mobile-first. Components adjust seamlessly from small phones to large desktops.

**Practical Application**
- Buttons and inputs include `aria-label` or `<label>` tags for screen readers.
- Breakpoints use Tailwind’s default (sm, md, lg, xl) to stack or resize cards and tables.
- Focus states and hover states are clearly visible.

## 3. Styling and Theming

**Styling Approach**
- **Tailwind CSS (Utility-First)**: No separate CSS files; utility classes live alongside markup.
- **Dark Mode**: Configured with Tailwind’s `media` strategy—users’ OS preference triggers light or dark theme.

**Visual Style**
- **Style**: Modern, flat design with subtle shadows and rounded corners for cards and modals.
- **Glassmorphism Accents**: Dashboard summary cards use a slight translucent background with backdrop blur for a modern touch.

**Color Palette**
- Primary: `#3B82F6` (Blue)
- Secondary: `#6366F1` (Indigo)
- Success: `#10B981` (Green)
- Warning: `#F59E0B` (Amber)
- Danger: `#EF4444` (Red)
- Background Light: `#F8FAFC`
- Background Dark: `#1F2937`
- Card Light: `#FFFFFF`
- Card Dark: `#374151`
- Text Light: `#111827`
- Text Dark: `#F9FAFB`

**Font**
- **Inter**: A clean, highly legible sans-serif font for both headings and body text.

## 4. Component Structure

**Organization**
```
/components
  /ui          # shadcn/ui wrappers and shared low-level parts
  /dashboard   # summary cards, filters, table helpers
  /forms       # form fields and ComboboxWithCreate
  /layout      # Header, Sidebar, Footer
```

**Reusable & Atomic**
- **Atomic Components**: Buttons, Inputs, Dialogs under `/components/ui`.
- **Composite Components**: Tables with pagination, summary cards, and modals built from atomic parts.

**Benefits**
- **Consistency**: Shared props and styles avoid drift.
- **Ease of Maintenance**: Fix a bug in one place; all pages inherit the fix.

## 5. State Management

**Approach**
- **Server Components & Server Actions**: Fetch and mutate data on the server with minimal client bundle.
- **Local Component State**: Use React’s `useState` and `useEffect` for form inputs, toggles, and pagination.
- **Context API**: Share global state like auth session and theme mode across the app.

**Why This Works**
- Avoids heavyweight libraries like Redux for a mid-sized dashboard.
- Keeps business logic on the server for security and performance.

## 6. Routing and Navigation

**File-Based Routing**
- Pages live under `/app`:
  - `/app/dashboard/page.tsx` for the main stats view.
  - `/app/dashboard/aplikasi/page.tsx` for list view.
  - `/app/dashboard/aplikasi/new/page.tsx` and `/[id]/edit/page.tsx` for forms.
- **Nested Layouts**: A root `layout.tsx` provides nav, sidebar, and footer for all dashboard pages.

**Navigation Flow**
1. User logs in via Better Auth.
2. Redirected to `/dashboard`.
3. Top nav or sidebar links switch between entities (Aplikasi, Vendor, etc.).
4. Buttons trigger client-side navigation or open modals for quick actions.

## 7. Performance Optimization

**Techniques**
- **Server Components**: Render static parts on the server to reduce client JS.
- **Code Splitting & Lazy Loading**: Dynamic imports for heavy components (e.g., chart libraries).
- **Tailwind JIT**: Generates only used CSS classes.
- **Image Optimization**: Next.js `Image` component auto-optimizes assets.
- **Caching**: Set appropriate cache headers on API routes and use in-memory or Redis caching for rarely changing lookup lists (frameworks, languages).

**Impact**
- Faster first paint.
- Smaller JS payloads.
- Smooth interactions even on mid-range devices.

## 8. Testing and Quality Assurance

**Unit Tests**
- **Jest & React Testing Library** for components and utility functions.
- Focus on form validation, button clicks, and conditional rendering.

**Integration Tests**
- Test Server Actions and API routes with **Supertest** or custom Drizzle mocks.
- Validate end-to-end CRUD flows in a test database.

**End-to-End Tests**
- **Playwright** or **Cypress** to simulate user journeys:
  - Sign-up/sign-in.
  - Dashboard metrics load.
  - Create/Edit/Delete aplikasi.

**Continuous Integration**
- Run linting, type checks, and all tests on every pull request (GitHub Actions).

## 9. Conclusion and Overall Frontend Summary

The **ngawi-apps-dashboard** frontend is built with modern, proven tools and patterns:
- **Next.js App Router** for routing and SSR/SSG.
- **TypeScript** and **Drizzle ORM** for end-to-end type safety.
- **Tailwind CSS** and **shadcn/ui** for consistent, responsive design.
- **Better Auth** for secure user access.

Every layer—from folder structure to testing—is designed to be clear, scalable, and maintainable. The result is a fast-loading, user-friendly dashboard that can grow with new features like role-based access, advanced table filtering, and external API integrations without sacrificing code quality or performance.