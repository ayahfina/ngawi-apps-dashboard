# ngawi-apps-dashboard: Project Requirements Document

## 1. Project Overview  
The Ngawi Government Application Management System is a secure, full-stack web dashboard built to centralize and streamline how the Ngawi Regency government tracks, organizes, and maintains all its software applications. It provides authorized staff with a single place to view summary statistics—such as total registered applications, active vs. inactive counts, and the number of departments (`perangkat_daerah`) with at least one application—while offering fast, intuitive CRUD (Create, Read, Update, Delete) operations on the underlying data.

This system is being built to replace disconnected spreadsheets and ad-hoc records, ensuring data integrity and real-time visibility into the application portfolio. Key objectives include:  
- Secure authentication for government employees.  
- A responsive, accessible interface with dark-mode support.  
- Type-safe database interactions with PostgreSQL and Drizzle ORM.  
- Well-defined API endpoints for potential integrations.  
Success will be measured by user adoption within the first month, accurate real-time reporting, and zero critical security incidents.

## 2. In-Scope vs. Out-of-Scope  
**In-Scope (Version 1)**  
- User signup, sign-in, and session management via Better Auth.  
- Main dashboard page showing summary cards: total apps, active vs. inactive counts, number of agencies.  
- Full CRUD UI and server logic for:  
  • `aplikasi` (applications)  
  • `perangkat_daerah` (government departments)  
  • `vendor` (vendors)  
  • `pic` (persons in charge)  
  • `bahasa_pemrograman` (programming languages)  
  • `framework` (software frameworks)  
- Custom “Combobox with Create” component to select or add related entities inline.  
- Server-side routes (Next.js App Router) and API routes (`/api/...`) exposing GET, POST, PUT/PATCH, DELETE for each entity.  
- Database schema definitions and migrations via Drizzle ORM for PostgreSQL.  
- Responsive UI built with shadcn/ui components and Tailwind CSS.  

**Out-of-Scope (Planned for Later Phases)**  
- Role-Based Access Control beyond basic authenticated vs. unauthenticated.  
- Advanced table features like server-side pagination, dynamic filtering, and sorting.  
- Mobile-specific app or offline mode.  
- Third-party integrations (e.g., external analytics, payment gateways).  
- Formal API documentation (Swagger/OpenAPI)—to be added later.  

## 3. User Flow  
When an authorized staff member visits the system, they land on the sign-in page powered by Better Auth. After authenticating, they are redirected to the Dashboard. Here, the Server Component loads summary metrics (e.g., total apps, active/inactive split, number of departments) via Drizzle ORM queries. A left-hand navigation bar links to each entity’s management page (Applications, Departments, Vendors, etc.).

If the user clicks “Applications,” they see a Client Component with a data table of all records. They can click “Add New” to open a full-page form. That form uses our custom Combobox with Create control: for example, picking a department from a dropdown or clicking “+ Add Department” to open a modal, fill it out, and seamlessly add it to the main form without losing state. On form submission, a Server Action or API call validates and persists data to PostgreSQL through Drizzle, then redirects back to the table with feedback (success or validation errors).

## 4. Core Features  
- **Authentication & Authorization**:  
  • Signup, signin, signout, session management via Better Auth.  
- **Dashboard Summary**:  
  • Server Component fetching aggregate counts (total apps, statuses, agencies).  
- **CRUD Management Pages**:  
  • Applications, Departments, Vendors, PICs, Languages, Frameworks.  
- **Inline Entity Creation**:  
  • Reusable Combobox + Modal component to select or add related entities in one flow.  
- **API Endpoints**:  
  • RESTful routes for external GET/POST/PUT/DELETE. Consistent JSON response format.  
- **Responsive UI**:  
  • shadcn/ui components (Tables, Forms, Dialogs, Cards), styled with Tailwind CSS and dark-mode support.  
- **Database Schema & ORM**:  
  • Drizzle ORM schemas and migrations for PostgreSQL tables per provided DDL.  
- **Server Actions & Lib Functions**:  
  • encapsulated database operations for all CRUD tasks.  

## 5. Tech Stack & Tools  
- Frontend Framework: Next.js (App Router)  
- Language: TypeScript  
- Authentication: Better Auth  
- ORM: Drizzle ORM (Type-safe Postgres)  
- Database: PostgreSQL  
- UI Library: shadcn/ui (prebuilt React components)  
- Styling: Tailwind CSS  
- Routing: File-based Next.js App Router  
- Build Tool/Runtime: Node.js  
- IDE Integrations (optional): VSCode with Drizzle and Tailwind CSS IntelliSense plugins

## 6. Non-Functional Requirements  
- **Performance**:  
  • Initial dashboard server component load < 1s.  
  • API responses < 200ms under normal load.  
- **Security**:  
  • HTTPS enforcement, secure JWT or session cookies.  
  • Input validation and sanitization to prevent SQL injection.  
- **Compliance & Accessibility**:  
  • WCAG AA standards for contrast and keyboard navigation.  
  • Dark mode toggle for accessibility.  
- **Usability**:  
  • Form validation with clear error messages.  
  • Consistent feedback (toasts or inline alerts) on success/failure.  
- **Reliability**:  
  • 99.9% uptime.  
  • Automated backups of PostgreSQL database nightly.  

## 7. Constraints & Assumptions  
- **Constraints**:  
  • PostgreSQL must be available and network-accessible.  
  • Better Auth service uptime and API limits.  
  • Must deploy on Node.js-compatible hosting.  
- **Assumptions**:  
  • Users have modern browsers (Chrome, Edge, Firefox, Safari).  
  • Internet connection is stable (no offline mode).  
  • Data volume is moderate (<10k records per table initially).  

## 8. Known Issues & Potential Pitfalls  
- **Database Migrations**:  
  • Drizzle ORM’s migration tool requires careful versioning. Mitigation: establish a clear migration naming convention and test migrations on a staging database.  
- **Custom Combobox Complexity**:  
  • Maintaining form state across modal dialogs can cause bugs. Mitigation: use React Hook Form or a similar library to manage field state and resets.  
- **API Rate Limits**:  
  • Better Auth or other services may throttle requests. Mitigation: implement exponential backoff and caching for repetitive calls.  
- **Concurrency & Relations**:  
  • Deleting a department (`perangkat_daerah`) with linked applications can violate FK constraints. Mitigation: enforce soft deletes or cascade rules, and warn users before destructive actions.  
- **UI Consistency**:  
  • Mixing Server and Client Components can lead to hydration mismatches. Mitigation: strictly separate concerns—use Server Components only for data fetching and Client Components for interactive pieces.

---
This PRD provides an unambiguous roadmap for building the Ngawi Government Application Management System. Subsequent documents—such as detailed Tech Stack specifications, Frontend Guidelines, Backend Architecture, and App Flow diagrams—can be generated directly from this foundation without further clarification.