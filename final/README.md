# Navjeevan Clinic Management System

Navjeevan Clinic is a full-stack MERN healthcare platform for a women's health clinic. It provides separate patient, doctor and admin experiences while keeping appointments, profiles, pregnancy/wellness tracking, payments and notifications connected to the same backend.

## Main Modules

### Patient portal
- Secure registration, login and OTP verification.
- Patient profile and state management.
- Appointment booking for clinic visits and video consultations.
- Real-time availability that excludes already-passed slots for today.
- My Bookings with filtering, cancellation and **one-time rescheduling for confirmed appointments**.
- Old video consultations are not joinable after their consultation window.
- Period, fertility, pregnancy and wellness tracking.
- Pregnancy health tools for weight, nutrition, hydration and medications/supplements.
- Medication logging asks only for prescribed dosage and frequency; height and weight are not repeatedly requested.
- Symptoms logging card has been removed from the pregnancy health dashboard.
- Medical records, prescriptions, reviews, chatbot and voice assistant.
- Razorpay payment support and email/SMS notification integration through environment configuration.

### Doctor portal
- Doctor login and personal dashboard.
- Appointment and patient management.
- Working patient search from the top-right search box: type a name and press Enter.
- Patient history, prescriptions, medical reports and reminders.
- Video consultation workflow for active/current confirmed appointments only.
- Editable doctor profile. Saved changes persist in the Doctor collection and are reflected after refresh.

### Admin portal
- Dashboard analytics.
- Appointment and review management.
- Doctor profile management and doctor creation.
- Service management.
- Past appointments cannot be confirmed.
- Doctor profile changes are no longer overwritten by hard-coded profile values.

## Appointment Rules
- Appointments can be booked from today up to 14 days ahead.
- Past slots are excluded for today's date.
- Sundays are unavailable.
- Pending/confirmed appointments reserve their doctor/date/time slot.
- A confirmed appointment can be rescheduled by the patient **only once**.
- The reschedule count is stored in the database and enforced on the server.
- Past appointments cannot be confirmed.
- Video access opens shortly before the appointment and expires after the consultation window.

## Technology
- Frontend: React, TypeScript, Vite, Tailwind CSS, Lucide icons.
- Backend: Node.js, Express, MongoDB and Mongoose.
- Authentication: JWT and OTP/email flows.
- Payments: Razorpay integration.
- Notifications: Nodemailer and optional Twilio SMS configuration.
- Video: Jitsi meeting links with server-side authorization and time gating.

## Project Structure

```text
Navjeevan Clinic/
├── client/          React + Vite frontend
├── server/          Express + MongoDB backend
├── package.json     Root project scripts
├── start-frontend.bat
├── start-backend.bat
└── README.md
```

## Setup

### 1. Install dependencies

```bash
cd server
npm install
```

In another terminal:

```bash
cd client
npm install
```

### 2. Configure environment files

Copy `server/.env.example` to `server/.env` and fill in your MongoDB, JWT, email, payment and optional Twilio credentials.

Copy `client/.env.example` to `client/.env` if your frontend API URL differs from the default configuration.

Never commit real secrets to Git.

### 3. Start the backend

```bash
cd server
npm run dev
```

### 4. Start the frontend

```bash
cd client
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

## Production Notes
- Use HTTPS and production environment variables.
- Configure a managed MongoDB backup strategy.
- Keep JWT, SMTP, Razorpay and Twilio secrets outside the repository.
- Use the Razorpay webhook secret when webhook verification is enabled.
- Install dependencies from `package.json`/`package-lock.json`; `node_modules` has intentionally been removed from this cleaned project archive.
