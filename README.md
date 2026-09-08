# Enrollment Review Workbench

A polished, production-style operations dashboard for reviewing insurance enrollment submissions. This project focuses on helping an operations team quickly triage high-priority cases, inspect applicant details, and make approval or correction decisions with clear status feedback.

## Overview

The application provides a review queue for enrollment submissions with:

- fast search by applicant name or email
- filters for employer group and review reason
- sortable prioritization for operational efficiency
- a detail drawer for reviewing full submission context without leaving the queue
- approval and return-for-correction actions with validation and retry handling
- responsive, accessible UI patterns designed for day-long usage

This project is designed to feel like a real internal business tool, not a coding exercise. It demonstrates frontend architecture, state management, data handling, and user experience decisions that would be relevant in a professional product setting.

## Tech Stack

- React
- TypeScript
- Vite
- TanStack Query
- Axios
- Tailwind CSS
- shadcn/ui components

## Features

- Review queue with status, priority, and sorting logic
- Search and filter controls for operational workflow
- Submission detail panel with applicant, employment, and enrollment context
- Decision validation and conflict handling for duplicate or stale actions
- Empty states, loading states, error states, and retry flow
- Accessible keyboard and focus behavior

## Local Setup

Install dependencies:

```powershell
npm install
```

Start the mock API server:

```powershell
node mock-api.js
```

The mock API runs at `http://localhost:4000`.

Start the frontend app:

```powershell
npm run dev
```

Open the local URL shown in the terminal, typically `http://localhost:5173`.

## Useful Commands

Run the test suite:

```powershell
npm run test
```

Run a production build and TypeScript validation:

```powershell
npm run build
```

## Project Structure

```text
src/
  features/
    enrollment-review/
      components/
      hooks/
  services/
    enrollment-review/
```

## Deployment

This project is structured so it can be deployed to a hosting platform such as Vercel, Netlify, or a similar frontend host. For deployment, the app can be built with the production command and served from the generated static output.

## Notes

This application uses a mock API to simulate realistic service behavior, including retries, validation errors, and stale review conflicts. The UI is built to handle those edge cases gracefully and reflect how real operational tooling behaves under imperfect backend conditions.

## Contact

For inquiries, collaborations, or project discussions, feel free to reach out.

