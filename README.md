# AI-Powered Healthcare Appointment & Follow-up System

[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-stack healthcare appointment system that supports patient booking, doctor consultations, administrative doctor and leave management, and AI-assisted visit summaries. The platform uses role-based access control and integrates email and Google Calendar services around the booking workflow.

> This is an assessment project. AI-generated content is assistive information only and must not be treated as a clinical diagnosis or medical advice.

## Contents

- [Features](#features)
- [System architecture](#system-architecture)
- [Tech stack](#tech-stack)
- [Folder structure](#folder-structure)
- [Installation](#installation)
- [Environment variables](#environment-variables)
- [Database schema](#database-schema)
- [API documentation](#api-documentation)
- [AI prompt design](#ai-prompt-design)
- [Integrations and reliability](#integrations-and-reliability)
- [Deployment](#deployment)
- [Future improvements](#future-improvements)
- [Screenshots](#screenshots)

## Features

| Area | Implemented capabilities |
| --- | --- |
| Authentication | Patient registration, JWT login, protected API routes, and `ADMIN`, `DOCTOR`, and `PATIENT` role checks. |
| Administration | Create, view, update, and delete doctors; view leaves; add and remove doctor leave dates. |
| Patient booking | Authenticated doctor listing, doctor search in the UI, available-slot lookup, booking, and local appointment-history display. |
| Doctor workflow | View the authenticated doctor's appointments, filter by date/status/search, record clinical notes and a structured prescription. |
| AI assistance | Pre-visit symptom summary with urgency and suggested questions; post-visit patient-friendly summary. |
| Notifications | Booking, reminder, cancellation, and doctor-leave email functions with persistent notification logs. |
| Calendar | Google Calendar event creation, update, and deletion helpers; booking persists the created event ID when available. |
| Booking integrity | Time-slot validation, doctor-leave validation, transaction-based writes, and a database uniqueness constraint to prevent duplicate slots. |

## System architecture

The React single-page application calls the Express REST API through Axios. Express authenticates JWTs, validates requests, and coordinates Prisma transactions against PostgreSQL. Optional external services enrich a completed booking without making the core booking dependent on them.

```mermaid
flowchart LR
  U[Patient / Doctor / Admin] --> F[React + Vite frontend]
  F -->|HTTPS + JWT| B[Node.js + Express API]
  B --> P[Prisma ORM]
  P --> D[(PostgreSQL on Neon)]
  B --> AI[Groq API]
  B -. Pre-visit fallback .-> G[Google Gemini API]
  B --> C[Google Calendar API]
  B --> E[Nodemailer / SMTP]
```

## Tech stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Frontend | React, Vite | Client-side UI and production builds. |
| Styling | Tailwind CSS | Responsive application styling. |
| HTTP client | Axios | API requests and JWT request interceptor. |
| Backend | Node.js, Express | REST API, middleware, validation, and business rules. |
| Validation | express-validator | Request parameter and body validation. |
| Database | PostgreSQL (Neon) | Relational persistence. |
| ORM | Prisma | Schema definition, migrations, transactions, and queries. |
| Authentication | JSON Web Tokens, bcrypt | Stateless authentication and password hashing. |
| AI | Groq API | Structured post-visit summaries and pre-visit fallback. |
| AI fallback | Google Gemini API | Optional structured pre-visit summary provider. |
| Email | Nodemailer | SMTP-based appointment notifications. |
| Calendar | Google Calendar API | Appointment event synchronization. |
| Deployment | Vercel, Render, Neon | Frontend, backend, and database hosting respectively. |

## Folder structure

```text
Healthcare_Appointment/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Prisma data model
│   ├── src/
│   │   ├── config/                # Prisma database client
│   │   ├── controllers/           # HTTP request handlers
│   │   ├── middleware/            # Authentication, authorization, errors
│   │   ├── routes/                # Express route definitions
│   │   ├── services/              # Domain logic and external integrations
│   │   ├── app.js                 # Express configuration and route mounting
│   │   └── server.js              # Application entry point
│   └── package.json
├── frontend/
│   ├── api/                       # Axios client
│   ├── components/                # Shared UI components
│   ├── context/                   # Authentication context
│   ├── layouts/                   # Dashboard layout
│   ├── pages/                     # Public and role-specific screens
│   ├── routes/                    # Protected-route component
│   ├── src/                       # Application entry and route tree
│   └── package.json
└── README.md
```

## Installation

### Prerequisites

- Node.js 20 or later
- A PostgreSQL database (Neon is used in deployment)
- A Groq API key for AI summaries
- Optional: Google OAuth and SMTP credentials for calendar and email features

### Backend

```bash
cd backend
npm install
```

Create `backend/.env` from the example below, then generate the Prisma client and start the API:

```bash
npx prisma generate
npm run dev
```

The API runs on `http://localhost:5000` when `PORT=5000`.

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the Vite development server:

```bash
npm run dev
```

For a production build:

```bash
npm run build
```

## Environment variables

Never commit real credentials. Use the following as `backend/.env.example`:

```env
# Server
PORT=5000

# PostgreSQL / Prisma
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"

# Authentication
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1h

# AI (Groq is required for post-visit summaries)
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.3-70b-versatile

# Optional Gemini pre-visit provider; Groq is used as fallback when configured
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-flash-latest

# SMTP / Nodemailer
EMAIL_SERVICE=gmail
EMAIL_USER=your-smtp-user@example.com
EMAIL_PASS=your-smtp-app-password
EMAIL_FROM="Healthcare Appointment <your-smtp-user@example.com>"

# Google Calendar OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-google-oauth-refresh-token
GOOGLE_CALENDAR_ID_DOCTOR=primary
GOOGLE_CALENDAR_ID_PATIENT=primary
```

The current calendar implementation writes to the OAuth account's `primary` calendar. The calendar ID environment variables are retained for deployment configuration but are not read by the current service.

For `frontend/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Database schema

| Model | Responsibility |
| --- | --- |
| `User` | Authentication identity with name, email, password hash, role, and optional one-to-one doctor or patient profile. |
| `Doctor` | Doctor-specific specialization, working-hours JSON, slot duration, leave records, and appointments. |
| `Patient` | Patient profile connected one-to-one to a `User`; owns appointments. |
| `Appointment` | Links one doctor and patient to a start/end slot, status, symptoms, consultation details, AI summaries, and calendar event IDs. |
| `Leave` | A doctor's unavailable calendar date. It is unique per doctor/date. |
| `NotificationLog` | Audit record for booking, reminder, cancellation, and leave-notification delivery outcomes. |
| `ReminderLog` | Timestamped record of reminder processing for an appointment. |

### Relationships and constraints

- A `User` may have one `Doctor` profile or one `Patient` profile.
- A `Doctor` and a `Patient` can each have many `Appointment` records.
- A `Doctor` has many `Leave` records.
- An `Appointment` has many `NotificationLog` and `ReminderLog` records.
- `@@unique([doctorId, slotStart])` prevents two appointments using the same doctor's start time.

```mermaid
erDiagram
  USER ||--o| DOCTOR : has
  USER ||--o| PATIENT : has
  DOCTOR ||--o{ APPOINTMENT : receives
  PATIENT ||--o{ APPOINTMENT : books
  DOCTOR ||--o{ LEAVE : has
  APPOINTMENT ||--o{ NOTIFICATION_LOG : produces
  APPOINTMENT ||--o{ REMINDER_LOG : records

  USER {
    uuid id PK
    string email UK
    string role
  }
  DOCTOR {
    uuid id PK
    uuid userId FK
    json workingHours
    int slotDuration
  }
  PATIENT {
    uuid id PK
    uuid userId FK
  }
  APPOINTMENT {
    uuid id PK
    uuid doctorId FK
    uuid patientId FK
    datetime slotStart
    datetime slotEnd
    string status
  }
  LEAVE {
    uuid id PK
    uuid doctorId FK
    date date
  }
```

## API documentation

Base URL: `/api`  
Protected routes require `Authorization: Bearer <JWT>`.

### Authentication

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Service health endpoint. |
| `POST` | `/auth/register` | No | Register a patient user and patient profile. |
| `POST` | `/auth/login` | No | Authenticate and return a JWT plus safe user details. |

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Asha Patel",
  "email": "asha@example.com",
  "password": "secure-password"
}
```

```json
{ "user": { "id": "uuid", "name": "Asha Patel", "email": "asha@example.com", "role": "PATIENT", "createdAt": "2026-01-01T00:00:00.000Z" } }
```

```http
POST /api/auth/login
Content-Type: application/json

{ "email": "asha@example.com", "password": "secure-password" }
```

```json
{ "token": "jwt", "user": { "id": "uuid", "name": "Asha Patel", "email": "asha@example.com", "role": "PATIENT", "patient": { "id": "uuid" } } }
```

### Admin

All routes below require an `ADMIN` JWT.

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/admin/doctors` | Create a doctor and linked doctor user. |
| `GET` | `/admin/doctors` | List doctors. |
| `GET` | `/admin/doctors/:id` | Get one doctor. |
| `PUT` | `/admin/doctors/:id` | Update specialization, slot duration, or working hours. |
| `DELETE` | `/admin/doctors/:id` | Delete a doctor without existing appointments. |
| `GET` | `/admin/leaves` | List all recorded leaves. |
| `POST` | `/admin/doctors/:id/leaves` | Add a leave date and identify affected booked appointments. |
| `DELETE` | `/admin/doctors/:id/leaves/:leaveId` | Remove a leave record. |

```http
POST /api/admin/doctors
Authorization: Bearer <admin-jwt>
Content-Type: application/json

{
  "name": "Dr. Rao",
  "email": "rao@example.com",
  "password": "secure-password",
  "specialization": "Cardiology",
  "slotDuration": 30,
  "workingHours": { "mon": ["09:00", "17:00"], "wed": ["09:00", "17:00"] }
}
```

```json
{ "doctor": { "id": "uuid", "specialization": "Cardiology", "slotDuration": 30, "workingHours": { "mon": ["09:00", "17:00"] }, "user": { "id": "uuid", "name": "Dr. Rao", "email": "rao@example.com", "role": "DOCTOR" } } }
```

```http
POST /api/admin/doctors/:id/leaves
Authorization: Bearer <admin-jwt>
Content-Type: application/json

{ "date": "2026-08-15" }
```

```json
{ "leave": { "id": "uuid", "doctorId": "uuid", "date": "2026-08-15T00:00:00.000Z" }, "affectedAppointmentIds": ["uuid"] }
```

`GET` collection routes respond with `{ "doctors": [...] }` or `{ "leaves": [...] }`; `GET`/`PUT` a doctor responds with `{ "doctor": {...} }`; successful deletes return `204 No Content`.

### Doctors and slots

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/doctors` | JWT | List doctors available to an authenticated user. |
| `GET` | `/doctors/:doctorId/slots?date=YYYY-MM-DD` | No | Return available slots for a doctor/date. |
| `GET` | `/doctor/appointments?date=&status=&search=` | `DOCTOR` | List the authenticated doctor's appointments. |

```http
GET /api/doctors/:doctorId/slots?date=2026-08-15
```

```json
["09:00", "09:30", "10:00"]
```

```http
GET /api/doctor/appointments?status=BOOKED&date=2026-08-15
Authorization: Bearer <doctor-jwt>
```

```json
{ "appointments": [{ "id": "uuid", "status": "BOOKED", "slotStart": "2026-08-15T09:00:00.000Z", "patient": { "user": { "name": "Asha Patel" } } }] }
```

### Appointments

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/appointments` | `PATIENT` | Book a slot for the patient identified by the JWT. |

```http
POST /api/appointments
Authorization: Bearer <patient-jwt>
Content-Type: application/json

{
  "doctorId": "doctor-uuid",
  "slotStart": "2026-08-15T09:00:00.000Z",
  "symptoms": "Persistent headache for two days"
}
```

```json
{ "appointment": { "id": "uuid", "doctorId": "doctor-uuid", "patientId": "patient-uuid", "slotStart": "2026-08-15T09:00:00.000Z", "slotEnd": "2026-08-15T09:30:00.000Z", "status": "BOOKED" } }
```

Typical booking errors are `409` for an unavailable/duplicate slot or leave date, `404` for a missing doctor/patient profile, and `422` for invalid request data.

### Consultation

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `PUT` | `/appointments/:appointmentId/consultation` | `DOCTOR` | Save a consultation for an appointment assigned to the logged-in doctor. |

```http
PUT /api/appointments/:appointmentId/consultation
Authorization: Bearer <doctor-jwt>
Content-Type: application/json

{
  "clinicalNotes": "Symptoms reviewed and patient advised to rest.",
  "prescription": {
    "medicines": [
      { "name": "Example medicine", "dosage": "500 mg", "frequency": "Twice daily", "days": 3 }
    ]
  }
}
```

```json
{ "appointment": { "id": "uuid", "status": "COMPLETED", "clinicalNotes": "Symptoms reviewed and patient advised to rest.", "prescription": { "medicines": [{ "name": "Example medicine" }] }, "postVisitSummary": { "diagnosis": "...", "medicationSchedule": ["..."], "lifestyleAdvice": ["..."], "followUpSteps": ["..."] } } }
```

## AI prompt design

### Pre-visit prompt

**Purpose:** Convert a patient's symptom text into a concise triage-oriented summary for the consultation workflow.

**Required JSON:**

```json
{
  "urgency": "Low | Medium | High",
  "chiefComplaint": "string",
  "suggestedQuestions": ["question 1", "question 2", "question 3"]
}
```

The service instructs the model to return JSON only, validates the parsed structure, and requires exactly three suggested questions. The pre-visit path first uses Gemini if `GEMINI_API_KEY` is configured; a failed Gemini call falls back to Groq when available. This fallback was added because Gemini 2.5 Flash availability can vary for new API users.

**Failure handling:** A pre-visit failure does not cancel the appointment. The booking remains valid and the appointment is marked with `llmFailed: true` when that status can be persisted.

### Post-visit prompt

**Purpose:** Turn doctor-entered clinical notes and a structured prescription into a patient-friendly follow-up summary.

**Required JSON:**

```json
{
  "diagnosis": "string",
  "medicationSchedule": ["string"],
  "lifestyleAdvice": ["string"],
  "followUpSteps": ["string"]
}
```

The post-visit service uses Groq with JSON-object response mode and validates all required non-empty fields. If generation fails, the clinical notes and prescription are still saved, the appointment is marked `COMPLETED`, and `postVisitSummary` remains `null`.

## Integrations and reliability

### Google Calendar integration

1. Create OAuth client credentials in Google Cloud and supply the client ID and secret.
2. Obtain a refresh token for the Google account that owns the target calendar.
3. On a successful booking, the backend attempts to create an event in that account's primary calendar and persists the returned calendar event ID.
4. The calendar service also exposes update and deletion helpers for appointment events.
5. If OAuth configuration is missing or an API call fails, the integration logs a warning and booking continues without a calendar event.

### Email notification flow

```mermaid
flowchart LR
  B[Appointment booked] --> C[Attempt Calendar event]
  C --> E[Start booking email task]
  E --> L[Create NotificationLog: PENDING]
  L --> S{SMTP send succeeds?}
  S -->|Yes| OK[NotificationLog: SENT]
  S -->|No| F[NotificationLog: FAILED + lastError]
```

Booking confirmation is started after the appointment is saved. Reminder, cancellation, and doctor-leave notification functions use the same logging pattern. An email failure is recorded in `NotificationLog` and does **not** roll back the booking.

### Double-booking prevention

- The `Appointment` model has a unique constraint on `[doctorId, slotStart]`.
- Appointment creation runs within a Prisma transaction.
- The service validates doctor working hours, slot duration, and leave dates before insertion.
- Prisma unique-constraint error `P2002` becomes a clear `409 Conflict` response: `This slot has already been booked.`

### Doctor leave handling

Leaves are stored per doctor and calendar date. Slot generation excludes a doctor's leave date, and appointment creation independently checks the `Leave` table as a second safeguard. When an admin adds leave, the service identifies affected `BOOKED` appointments and attempts doctor-leave notifications. Existing appointments are identified and notified; the current implementation does not automatically cancel or reschedule them.

### Notification failure handling

Email credentials are optional for core booking. Missing SMTP credentials, unavailable mail services, and missing patient email addresses result in a failed notification log rather than a rolled-back appointment. `lastError` retains the delivery reason for diagnosis.

## Deployment

| Component | Service | Configuration |
| --- | --- | --- |
| Backend | Render | Root directory: `backend`; build command: `npm install`; start command: `npm start`; configure all backend environment variables in Render. |
| Frontend | Vercel | Root directory: `frontend`; set `VITE_API_BASE_URL` to `https://<render-service>.onrender.com/api`; redeploy after changing Vite variables. |
| Database | Neon | Set the Neon connection string as `DATABASE_URL` in Render. |

For cross-origin deployment, the backend CORS allowlist must include the exact Vercel frontend origin (with no trailing slash). Do not expose backend secrets as Vite environment variables.


## Contributors

- **Mithil Jatkar** — Project author

## License

This project is licensed under the [MIT License](LICENSE).
