# Backend Structure Document for Ngawi-Apps-Dashboard

## 1. Backend Architecture

The backend of ngawi-apps-dashboard follows a modular, modern web architecture designed for clarity, scalability, and maintainability.

- **Framework & Language**
  - Next.js (App Router) for server-side rendering, file-based routing, and API routes
  - TypeScript for end-to-end type safety and fewer runtime errors
- **Design Patterns**
  - _Separation of Concerns_: UI components, server logic, and database definitions live in `/components`, `/app/api` (and `/lib`), and `/db/schema` respectively
  - _Server Components vs. Client Components_: Dashboard summary and data fetch happen in Server Components, while interactive tables and forms are implemented as Client Components
  - _File-Based Routing_: Each feature (e.g., aplikasi, vendor, perangkat_daerah) maps to its own directory under `/app`, making project structure intuitive and easy to extend
- **Scalability & Performance**
  - Stateless server endpoints: Each API route performs a single, well-defined operation
  - Database connection pooling (managed by Drizzle/Next.js) for efficient query handling under load
  - Clean layering allows horizontal scaling of frontend servers (e.g., on Vercel) and vertical scaling of the database

## 2. Database Management

- **Database Technology**
  - PostgreSQL as the primary relational store
  - Drizzle ORM for type-safe schema definitions and migrations
- **Data Structure & Access**
  - Schemas defined under `/db/schema` mirror the SQL DDL for entities: perangkat_daerah, aplikasi, vendor, pic, bahasa_pemrograman, framework
  - CRUD operations and complex queries (counts, groupings) executed via Drizzle’s fluent API in `/lib` or via Server Actions in Next.js
- **Practices**
  - Versioned migrations to keep database in sync across environments (development, staging, production)
  - Connection credentials and secrets managed through environment variables
  - Backups scheduled daily via managed PostgreSQL provider

## 3. Database Schema

### Human-Readable Overview

- **perangkat_daerah** (Agencies)
  - id (primary key), name, created_at, updated_at
- **vendor**
  - id, name, contact_info, created_at, updated_at
- **pic** (Point of Contact)
  - id, name, email, phone, created_at, updated_at
- **bahasa_pemrograman** (Programming Languages)
  - id, name, created_at, updated_at
- **framework**
  - id, name, created_at, updated_at
- **aplikasi** (Applications)
  - id, name, description, status (active/inactive), id_perangkat_daerah (FK), id_vendor (FK), id_pic (FK), created_at, updated_at
- **junction tables** for many-to-many between aplikasi and bahasa_pemrograman, aplikasi and framework

### SQL Definition (PostgreSQL)

```sql
CREATE TABLE perangkat_daerah (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE vendor (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  contact_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE pic (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE bahasa_pemrograman (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE framework (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE aplikasi (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  status VARCHAR(20) NOT NULL,
  id_perangkat_daerah INTEGER NOT NULL REFERENCES perangkat_daerah(id),
  id_vendor INTEGER NOT NULL REFERENCES vendor(id),
  id_pic INTEGER NOT NULL REFERENCES pic(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE aplikasi_bahasa (
  aplikasi_id INTEGER REFERENCES aplikasi(id) ON DELETE CASCADE,
  bahasa_id INTEGER REFERENCES bahasa_pemrograman(id) ON DELETE CASCADE,
  PRIMARY KEY (aplikasi_id, bahasa_id)
);

CREATE TABLE aplikasi_framework (
  aplikasi_id INTEGER REFERENCES aplikasi(id) ON DELETE CASCADE,
  framework_id INTEGER REFERENCES framework(id) ON DELETE CASCADE,
  PRIMARY KEY (aplikasi_id, framework_id)
);
```  

## 4. API Design and Endpoints

The backend exposes a standard RESTful API under `/app/api` to support both the internal dashboard and external integrations.

- **Authentication** (via Better Auth)
  - `POST /app/api/auth/signup` — Register a new user
  - `POST /app/api/auth/signin` — Log in and receive session token
  - Protected routes enforce a valid session or token

- **Aplikasi Endpoints**
  - `GET /app/api/aplikasi` — List all applications (supports query params: status, page, perPage)
  - `POST /app/api/aplikasi` — Create a new application record
  - `GET /app/api/aplikasi/{id}` — Retrieve details for a single application
  - `PUT /app/api/aplikasi/{id}` — Update an existing application
  - `DELETE /app/api/aplikasi/{id}` — Remove an application

- **Supporting Entity Endpoints**
  - `GET /app/api/perangkat-daerah`, `POST /app/api/perangkat-daerah` (and similar for vendor, pic, bahasa, framework)
  - Allow listing, creation, updating, and deletion of lookup tables

- **Summary Statistics**
  - `GET /app/api/dashboard/summary` — Returns total apps, active/inactive counts, agencies count

All endpoints return JSON with a consistent envelope, e.g. `{ success: true, data: ..., error: null }`.

## 5. Hosting Solutions

- **Frontend & API Hosting**
  - Vercel for Next.js apps: automatic deployments, built-in CDN, global edge network
  - Benefits: zero-config scaling, automatic SSL, preview deployments on every pull request
- **Database Hosting**
  - Managed PostgreSQL (AWS RDS, Supabase, or DigitalOcean Managed Databases)
  - Automated backups, point-in-time recovery, high availability across AZs
- **Environment Management**
  - Separate environments (development, staging, production) with isolated databases and credentials
  - Environment variables stored securely in Vercel and database provider dashboards

## 6. Infrastructure Components

- **Load Balancer & CDN**
  - Vercel’s edge network acts as a global CDN and load balancer for both static and dynamic content
- **Caching Mechanisms**
  - HTTP caching headers configured on API responses for low-change endpoints (e.g., list of frameworks)
  - Optional: Redis for server-side caching of expensive Dashboard summary queries
- **Content Delivery**
  - Static assets (images, fonts) served via CDN for minimal latency
- **Health Checks & Auto-Scaling**
  - Vercel auto-scales serverless functions based on traffic
  - Database provider pings /metrics endpoint for availability

## 7. Security Measures

- **Authentication & Authorization**
  - Better Auth manages secure sign-up, sign-in, session handling
  - Future expansion: role-based access control (Admin, Editor, Viewer) via middleware
- **Data Encryption**
  - HTTPS enforced end-to-end (TLS for all requests)
  - Data at rest encrypted automatically by managed PostgreSQL
- **Input Validation & Sanitization**
  - Server-side validation in API routes (using TypeScript guards or a validation library)
- **Secrets Management**
  - Database URLs, API keys, and auth secrets stored as environment variables; not in source control
- **Vulnerability Protection**
  - Regular dependency audits (npm audit) and automated security alerts via GitHub

## 8. Monitoring and Maintenance

- **Error Tracking & Performance**
  - Sentry or LogRocket for capturing runtime errors and performance metrics of serverless functions
  - Vercel Analytics for traffic patterns, latency, and error rates
- **Database Monitoring**
  - Provider-side dashboards (RDS CloudWatch, Supabase console) for slow queries, connection counts, CPU/RAM usage
- **Maintenance Strategies**
  - Scheduled database migrations via Drizzle CLI on staging then production
  - Daily automated backups and audit logs retention
  - Documentation of runbooks for incident response

## 9. Conclusion and Overall Backend Summary

The ngawi-apps-dashboard backend is built on a modern, scalable stack that aligns perfectly with the needs of the Ngawi Government Application Management System. Key points:

- A clear separation between UI, API logic, and database schema ensures maintainability
- TypeScript and Drizzle ORM guarantee type safety from database to frontend
- Next.js on Vercel plus a managed PostgreSQL delivers reliability, global performance, and cost-effective scaling
- Well-defined RESTful APIs cover both internal dashboard features and external integrations
- Security and monitoring practices protect user data and maintain high availability

Together, these components form a robust foundation that can grow with new features—such as advanced role-based access, server-side caching, and extended analytics—while providing a smooth developer and user experience.