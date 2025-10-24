# Security Guidelines for ngawi-apps-dashboard

This document outlines mandatory security practices and controls tailored to the `ngawi-apps-dashboard` project. It embeds security-by-design principles across authentication, data handling, service configuration, and deployment to ensure a robust, trustworthy Government Application Management System.

---

## 1. Introduction

- Purpose: Provide prescriptive security measures for the Next.js + Drizzle ORM + Better Auth stack.
- Scope: Covers design, implementation, testing, and deployment phases of the `ngawi-apps-dashboard`.
- Audience: Developers, DevOps engineers, security reviewers, and project stakeholders.

---

## 2. Core Security Principles

1. **Security by Design**: Build security into every layer—from schema definitions in `/db/schema/` to UI components in `/components/ui/`.
2. **Least Privilege**: Grant database roles, API tokens, and user permissions only the bare minimum required.
3. **Defense in Depth**: Combine network, application, and data-level controls (e.g., HTTPS, prepared statements, RBAC).
4. **Fail Securely**: Ensure error states do not leak stack traces, internal paths, or sensitive data.
5. **Secure Defaults**: Enforce secure settings by default (e.g., HTTPS-only cookies, strong password policy).

---

## 3. Authentication & Access Control

- **Better Auth Integration**
  - Enforce multi-factor authentication (MFA) for administrator roles.
  - Validate session tokens on every protected API route (`/app/api/...`).
  - Reject requests missing or presenting expired JWTs; verify `exp`, `iss`, and `aud` claims.
- **Password Policy**
  - Require a minimum length of 12 characters, mixed case, digits, and symbols.
  - Employ Argon2id or bcrypt with a per-user salt for password hashing.
  - Schedule periodic password rotation reminders for privileged accounts.
- **Role-Based Access Control (RBAC)**
  - Define roles (`Admin`, `Editor`, `Viewer`) in the database schema.
  - Enforce server-side permission checks in Server Actions or API route handlers.
  - Prevent privilege escalation by validating roles on each CRUD operation.
- **Session Management**
  - Issue HTTP-only, Secure, SameSite=strict cookies for session tokens.
  - Implement idle and absolute session timeouts with automatic revocation.
  - Protect against session fixation by regenerating tokens on login.

---

## 4. Input Handling & Processing

- **Server-Side Validation**
  - Validate all incoming JSON payloads against strict Zod/TypeScript schemas.
  - Reject malformed or unexpected fields early in the request pipeline.
- **Prevent Injection**
  - Use Drizzle ORM prepared statements for all database interactions; never interpolate user input into raw SQL.
  - Sanitize dynamic fields used in file paths or command invocations.
- **XSS Mitigation**
  - Encode user-supplied data before rendering in React components.
  - Implement a strict Content Security Policy (CSP) via HTTP headers.
- **File Upload Security** (if implemented)
  - Enforce a whitelist of MIME types and file extensions.
  - Scan uploads for malware and store them outside the webroot with restrictive ACLs.
- **Template Injection**
  - Avoid string concatenation in server-side JSX templates.
  - Sanitize any dynamic template variables using a library like `dompurify` if HTML is allowed.

---

## 5. Data Protection & Privacy

- **Encryption**
  - Enforce TLS 1.2+ for all client–server and internal service communications.
  - Encrypt sensitive columns (PII) at rest using AES-256 or database-native encryption.
- **Secrets Management**
  - Store API keys, database credentials, and JWT secrets in a vault (e.g., AWS Secrets Manager).
  - Rotate secrets regularly and restrict access via IAM policies.
- **Logging & Monitoring**
  - Redact PII and credentials from logs.
  - Implement structured logging (e.g., JSON) with a centralized SIEM.
- **Data Privacy**
  - Collect only necessary PII; mask or anonymize where possible.
  - Define data retention and deletion policies to comply with GDPR/CCPA.

---

## 6. API & Service Security

- **HTTPS Enforcement**
  - Redirect all HTTP traffic to HTTPS with HSTS (`Strict-Transport-Security` header).
- **Rate Limiting & Throttling**
  - Apply per-IP and per-user rate limits on critical endpoints (`/api/aplikasi`, `/api/auth`).
  - Fail gracefully with HTTP 429 and a standardized JSON error schema.
- **CORS Policy**
  - Restrict origins to approved domains (e.g., `dashboard.ngawi.go.id`).
  - Set `Access-Control-Allow-Credentials` only when necessary.
- **API Versioning**
  - Namespace endpoints (e.g., `/api/v1/aplikasi`) to support backward compatibility.
- **Error Handling**
  - Return consistent JSON error objects (`{ code: string, message: string }`).
  - Avoid revealing internal stack traces or SQL errors.

---

## 7. Web Application Security Hygiene

- **Security Headers**
  - `Content-Security-Policy`: Restrict script/style sources; enable `frame-ancestors 'none'`.
  - `X-Frame-Options: DENY`; `X-Content-Type-Options: nosniff`.
  - `Referrer-Policy: no-referrer` or `strict-origin-when-cross-origin`.
- **CSRF Protection**
  - Implement anti-CSRF tokens for all state-changing requests.
  - Use a synchronizer token pattern or SameSite cookies with Strict/ Lax settings.
- **Cookie Security**
  - Set `Secure` and `HttpOnly` flags on session cookies.
  - Apply `SameSite=Strict` to prevent cross-site leakage.
- **Third-Party Integrity**
  - Use Subresource Integrity (SRI) when loading external scripts.
  - Audit all client dependencies for known vulnerabilities.

---

## 8. Infrastructure & Configuration Management

- **Server Hardening**
  - Disable unused ports and services on the host machine.
  - Apply OS and library patches via a managed update pipeline.
- **TLS Configuration**
  - Use TLS 1.2+ with strong ciphers (ECDHE, AES-GCM).
  - Disable weak protocols (SSLv3, TLS 1.0/1.1).
- **Environment Separation**
  - Isolate dev, staging, and production environments with separate credentials and secrets.
  - Enforce immutable infrastructure practices (e.g., container images, infrastructure as code).
- **Backup & Recovery**
  - Implement automated, encrypted backups of the PostgreSQL database.
  - Regularly test restore procedures.

---

## 9. Dependency Management

- **Secure Dependencies**
  - Vet and pin `package.json` versions via `package-lock.json` or `yarn.lock`.
  - Perform automated SCA scans (e.g., Dependabot, Snyk) on every pull request.
- **Minimize Footprint**
  - Remove unused packages and dev dependencies in production builds.
- **Regular Updates**
  - Schedule quarterly dependency reviews and apply security patches promptly.

---

## 10. Implementation & Next Steps

1. **Security Review**: Conduct a formal threat model workshop with stakeholders.
2. **Checklist Integration**: Embed this guideline into the CI pipeline as a pre-merge security gate.
3. **Testing**:
   - Unit tests for input validation and authentication flows.
   - Penetration testing of critical endpoints.
4. **Documentation**: Publish an internal security playbook with escalation procedures.
5. **Continuous Monitoring**: Integrate runtime application security monitoring (RASP) and alert thresholds.

---

Adherence to these guidelines will ensure that `ngawi-apps-dashboard` remains secure, reliable, and compliant with government standards throughout its lifecycle.  

*Document Version: 1.0 — Last Updated: [YYYY-MM-DD]*