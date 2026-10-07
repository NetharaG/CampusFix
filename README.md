# CampusFix – Smart Campus Maintenance & Complaint Management System

An individual **Web Technology Lab** project built entirely with **HTML5**, **CSS3**, and **Vanilla JavaScript** — no frameworks, no backend, no login required.

---

## Problem Statement

In colleges, students and staff frequently face maintenance problems such as broken lights, faulty fans, water leakage, damaged furniture, Wi-Fi/network issues, laboratory equipment failures, classroom problems, cleanliness issues, and electrical faults.

Currently, these issues are reported verbally or through messaging apps. This makes it difficult to track complaints, identify priorities, and monitor whether an issue has been resolved.

## Proposed Solution

**CampusFix** provides a centralized web application where students and staff can submit maintenance complaints through a structured form and track their status from submission to resolution. Each complaint receives a unique ID, and a dashboard provides live statistics, search, filters, and sorting — all powered by browser `localStorage`.

## Objectives

- Provide a simple, centralized platform for reporting campus maintenance issues
- Replace untracked verbal/messaging-based reporting with a structured system
- Generate unique complaint IDs (CF001, CF002, CF003, …) for easy reference
- Display real-time statistics on complaint status and priority
- Enable searching, filtering, and sorting of complaints on a dashboard
- Show a visual status timeline from "Reported" to "Resolved"
- Demonstrate practical use of HTML5, CSS3, and JavaScript (DOM, events, localStorage, JSON)

## Features

- **Landing Page** – Hero section, problem statement, live statistics, features grid, how-it-works steps, benefits, and footer
- **Report Issue Page** – Professional complaint form with 8 fields and complete client-side validation
- **Dashboard Page** – Statistics cards (Total, Pending, In Progress, Resolved, Critical), searchable/filterable/sortable complaint table
- **Details Page** – Full complaint information with a visual status timeline (Reported → Under Review → In Progress → Resolved)
- **About Page** – Project description, problem, solution, objectives, benefits, and future enhancements
- **Form Validation** – Validates all fields with clear inline error messages; prevents submission when invalid
- **localStorage** – Complaints persist across page reloads using `JSON.stringify()` / `JSON.parse()`
- **Unique Complaint IDs** – Auto-generated sequential IDs (CF001, CF002, …)
- **Responsive Design** – Works on mobile, tablet, and desktop

## Technologies

- HTML5 (semantic structure, forms, input elements, select, textarea, tables)
- CSS3 (Flexbox, Grid, responsive design, hover effects, cards, navigation, forms)
- Vanilla JavaScript (DOM manipulation, event handling, form validation, localStorage, JSON, dynamic content generation)

## Project Structure

```
CampusFix/
├── index.html          # Landing page
├── report.html         # Report a complaint (form with validation)
├── dashboard.html      # Complaint dashboard (stats, search, filters, sort)
├── details.html        # Complaint details with status timeline
├── about.html          # About the project
├── css/
│   └── style.css       # All styles
├── js/
│   ├── main.js         # Home page logic (stats, navbar)
│   ├── report.js       # Form validation & complaint submission
│   ├── dashboard.js    # Dashboard: search, filter, sort, table generation
│   └── details.js      # Details page: timeline & complaint rendering
├── vite.config.js      # Vite multi-page build configuration
├── package.json
└── README.md
```

## How to Run

1. Install dependencies:
   ```
   npm install
   ```
2. Start the development server:
   ```
   npm run dev
   ```
3. Open the URL shown in the terminal (typically `http://localhost:5173`).

To build for production:
   ```
   npm run build
   ```

## Complaint Data Model

Each complaint is stored as a JSON object in `localStorage` under the key `campusfix_complaints`:

```json
{
  "complaintId": "CF001",
  "name": "John Doe",
  "email": "john@college.edu",
  "department": "Computer Science",
  "location": "Block A, Room 204",
  "category": "Electrical",
  "priority": "High",
  "description": "The ceiling light in the lab is flickering and may cause injury.",
  "date": "2026-10-07",
  "status": "Pending",
  "submittedAt": "2026-10-07T10:30:00.000Z"
}
```

## Status Flow

```
Reported → Under Review → In Progress → Resolved
```

New complaints default to **Pending** (shown as "Reported" on the timeline).

## Future Enhancements

- PHP backend or Servlet backend for server-side processing
- MySQL database for permanent complaint storage
- Admin login for maintenance staff
- Technician assignment to route complaints to the right personnel
- Email notifications when complaint status changes
- Real-time complaint tracking with live updates
- Analytics dashboard with charts and trend analysis
- Role-based access (students, staff, admins, technicians)
- Full CRUD operations (create, read, update, delete)

---

© 2026 CampusFix — Web Technology Lab Project.
