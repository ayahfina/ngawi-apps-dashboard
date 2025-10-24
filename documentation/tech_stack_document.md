# Tech Stack Document for ngawi-apps-dashboard

This document explains the technology choices behind the `ngawi-apps-dashboard` project in simple, everyday language. It covers the frontend, backend, infrastructure, integrations, and security considerations, making it easy for anyone to understand why each technology was picked and how they work together.

## 1. Frontend Technologies

Our frontend is all about giving users a smooth, responsive experience when managing government applications.

- **Next.js (App Router)**
  - A React-based framework that handles page routing and server rendering out of the box.
  - Enables a mix of fast-loading server components (for summary stats) and interactive client components (for tables and forms).
- **TypeScript**
  - Adds type checking to JavaScript, catching errors early and making the code easier to maintain.
- **Tailwind CSS**
  - A utility-first CSS framework that lets us style components quickly and consistently.
  - Ensures a clean, professional look without writing custom CSS from scratch.
- **shadcn/ui**
  - A set of pre-built UI components (tables, forms, dialogs, cards) designed to work seamlessly with Tailwind CSS.
  - Accelerates development of common dashboard elements.
- **Custom Components**
  - "Combobox with Create" (or "Select with Add") lets users pick an existing item (e.g., a department) or add a new one on the spot via a modal dialog.

How they enhance UX:

- Fast initial page loads (thanks to Next.js server components).
- Consistent styling and responsive layouts (via Tailwind CSS and shadcn/ui).
- Fewer errors and easier maintenance (with TypeScript).
- Smooth, in-place workflows (custom combobox component).

## 2. Backend Technologies

The backend powers data storage, retrieval, and business logic, ensuring the app runs reliably.

- **Drizzle ORM**
  - A modern, type-safe way to interact with the database.
  - Schemas are defined in code, matching your SQL tables (`aplikasi`, `perangkat_daerah`, `vendor`, etc.).
- **PostgreSQL**
  - A robust, open-source relational database.
  - Stores all application data with strong consistency guarantees.
- **Better Auth**
  - Handles user sign-up, sign-in, and session management.
  - Secures all CRUD operations so only authorized users can access or modify data.
- **Next.js API Routes / Server Actions**
  - Built-in way to expose backend endpoints (GET, POST, PUT/PATCH, DELETE).
  - Server Actions allow secure, server-side handling of form submissions.

How they work together:

1. Users authenticate via Better Auth.
2. Next.js API routes or Server Actions receive requests for data operations.
3. Drizzle ORM translates those requests into SQL queries.
4. PostgreSQL executes the queries and returns results.
5. The frontend displays updated data to the user.

## 3. Infrastructure and Deployment

We chose infrastructure components that make deploying, scaling, and maintaining the project straightforward.

- **Version Control: Git & GitHub**
  - All code is hosted in a GitHub repository for collaboration and tracking changes.
- **Hosting: Vercel**
  - Seamless deployment for Next.js applications.
  - Automatic build and deploy on every commit to the main branch.
- **CI/CD: GitHub Actions**
  - Runs tests, type checks, and linting on each pull request.
  - Ensures only quality code gets merged and deployed.
- **Environment Management**
  - Environment variables securely stored in Vercel for things like database connection strings and API keys.

Benefits:

- Automatic deployments keep staging and production in sync with the latest code.
- Pull request checks catch errors early.
- Easy rollback to previous versions if needed.

## 4. Third-Party Integrations

We rely on a few external services to enhance functionality and speed up development.

- **Better Auth**
  - Secure, managed authentication service eliminating the need to build your own.
- (Optional) **OpenAPI/Swagger**
  - Can be added later to generate interactive API documentation for external integrators.

Benefits:

- Offloading authentication to Better Auth reduces security risks and development time.
- Clear API docs improve integrations with other government systems or third-party tools.

## 5. Security and Performance Considerations

Security and performance go hand in hand to ensure a reliable, safe user experience.

Security Measures:

- Secure sessions and tokens managed by Better Auth.
- HTTPS enforced by the hosting provider (Vercel).
- Environment variables for sensitive data (no secrets in code).
- Role-based access control (future enhancement) to limit user permissions.

Performance Optimizations:

- Server Components where possible for faster initial loads.
- Database indexing on foreign keys and common query fields.
- Tailwind CSS "purge" feature to remove unused styles from production builds.
- Caching on static data (e.g., lists of programming languages) to reduce database load.

## 6. Conclusion and Overall Tech Stack Summary

This `ngawi-apps-dashboard` tech stack was chosen to balance developer productivity, security, and user experience. By combining:

- **Next.js + TypeScript** for a fast, type-safe frontend and backend framework
- **Tailwind CSS + shadcn/ui** for a consistent, responsive interface
- **Drizzle ORM + PostgreSQL** for reliable, type-safe data management
- **Better Auth** for secure, managed authentication
- **GitHub + Vercel + GitHub Actions** for smooth collaboration, automatic testing, and instant deployments

we have a solid foundation tailored to the Ngawi Government Application Management System. This stack not only meets today’s requirements but also scales for future enhancements like role-based permissions, advanced analytics, and comprehensive API documentation.