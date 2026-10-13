# Leave Management System (𐙚)

A full-stack, enterprise-grade **Leave Management System** built with **Angular**, **Spring Boot**, and **MongoDB**, featuring secure JWT authentication, role-based access control (Employee, Manager, Admin), and real-time dashboard analytics.

---

## 🎨 Theme & Aesthetics

Designed with a curated modern color palette:
- **Primary Accent / CTA:** `#F68282`
- **Hover / Deep Accent:** `#E06969`
- **Primary Text:** `#A5525D`
- **Secondary Text:** `#C1868E`
- **Background (Main):** `#FFF0EF`
- **Background (Card/Surface):** `#FAF5F5`
- **Borders / Dividers:** `#F5DCDD`

---

## 🚀 Technology Stack

- **Frontend:** Angular 19+ (Standalone components, Signals, Reactive routing, Custom Interceptors)
- **Backend:** Spring Boot 3.4.3 (REST APIs, Spring Security, BCrypt, Stateless JWT, Spring Data MongoDB)
- **Database:** MongoDB
- **Security:** JWT (JSON Web Tokens), Role-Based Authorization Guards & Security Filter Chains

---

## 🌟 Key Features & Workflows

### 1. Authentication & Security
- Secure Sign Up with duplicate email prevention and BCrypt password hashing.
- Public sign-ups are assigned the **Employee** role by default.
- Role-based redirection upon login to tailored dashboards.
- Role-protected routes on both client (Angular Route Guards) and server (Spring Security).

### 2. Employee Portal
- **Dashboard:** Live summary metrics (Total Requests, Pending, Approved, Rejected).
- **Apply for Leave:** Auto-filled read-only identity, date range validation, unique Request ID (`REQ-...`).
- **My Requests:** Track real-time status with manager decision feedback.
- **Edit & Delete:** Full CRUD access restricted strictly to pending requests.

### 3. Manager Portal
- **Team Dashboard:** Team-specific request metrics and pending request priority.
- **Single-Decision Review:** Approve or Reject pending team requests with instant feedback.
- **Decision History:** Immutable audit log recording decision timestamps and manager references.

### 4. Admin Portal
- **Manage Users:** Add, edit, activate, or deactivate users across Employee, Manager, and Admin roles.
- **Admin Protection:** Safeguard preventing removal or demotion of the last active Admin.
- **Historical Data Preservation:** Historical leave requests remain intact when accounts are deactivated.
- **Organization Overview:** Comprehensive view of all organization-wide leave records.

---

## 🔑 Pre-Configured Accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@company.com` | `Admin@123` |
| **Manager** | `manager@company.com` | `Manager@123` |
| **Employee** | `employee@company.com` | `Employee@123` |

*(You can also register a new Employee account anytime via the Sign Up page).*

---

## 🛠️ Getting Started

### Prerequisites
- **Java 17+ / 21+ / 25**
- **Node.js 18+ / 20+** & **npm**
- **MongoDB** running locally on port `27017`

### Running Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```
Backend runs on: `http://localhost:8080`

### Running Frontend (Angular)
```bash
cd frontend
npm install
npm start
```
Frontend runs on: `http://localhost:4200`
