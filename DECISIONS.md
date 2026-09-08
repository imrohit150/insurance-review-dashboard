## Product and UX decisions

- I designed for an operations user who reviews many records during the day.
- The default sort shows urgent and high-priority work first.
- Search supports applicant name or email. Filters support employer group and review reason.
- I used a right-side drawer so users can inspect details without leaving the queue.
- The queue shows triage fields. The drawer shows employee, employment, election, existing coverage, and review signals.
- Missing values are shown as `Not provided` instead of being left blank.
- Review signals show severity, message, code, and field. Meaning is communicated with text and color.
- I keep the search value after a decision. If the processed record disappears, the empty result explains what happened instead of unexpectedly resetting the user’s context.
- I made the workbench responsive and mobile-friendly so the queue, filters, detail drawer, decision actions, and toast remain usable across desktop and smaller screens.

## Technical approach

- I used React and TypeScript because the assignment requires them and because the API contains many nullable fields.
- UI code is under `src/features/enrollment-review`. API code and API types are under `src/services/enrollment-review`.
- TanStack Query manages server data, caching, loading, retries, cancellation, and refetching.
- Local React state manages the selected record, drawer state, Return note, and toast message.
- I chose Axios because it provides typed requests, JSON handling, cancellation, and convenient non-2xx error handling.
- Tailwind CSS handles styling. The shadcn drawer provides an accessible overlay and focus behavior.
- I did not add Zustand because this page needs one local drawer state, not a global drawer system.

## Reliability and edge cases

- The API client keeps the HTTP status, error code, details, and conflict submission so the UI can respond correctly.
- Search waits 500 ms after typing stops. TanStack Query also passes an `AbortSignal` to Axios, so old requests can be cancelled.
- A first-attempt `503` keeps the drawer open, preserves the action and note, and shows a Retry button.
- A `409 REVIEW_CONFLICT` closes the drawer, refreshes the queue, and shows that another reviewer acted first.
- A `409 ALREADY_DECIDED` closes the drawer, refreshes the queue, and explains that the record is no longer actionable.
- After a decision, the queue is refetched from the API. The UI does not rely only on local removal.
- Return notes are required and limited to 500 characters.
- Formatters handle cents, zero values, missing groups, null nested objects, missing dates, invalid dates, date-only values, Unicode names, and long text.
- The list API does not support pagination, so the app follows the supplied contract. A production API handling thousands of records should add server-side cursor pagination and possibly row virtualization.

## Accessibility

- Search, filters, and the note field have labels.
- The queue uses a semantic table, caption, and scoped column headers.
- Rows can be opened with Enter or Space.
- The drawer has an accessible title and description.
- Escape and the close button dismiss the drawer.
- Focus returns to the selected queue row when possible.
- Loading, refresh, success, and error messages use live regions or alert roles.
- Priority and severity use written labels, not color alone.

## AI usage

- I used GitHub Copilot to explore the supplied API, identify edge cases, scaffold the React/Vite setup, and draft implementation ideas.
- I reviewed and changed the generated work instead of accepting it blindly.
- I moved API code into the service layer, selected a controlled drawer, added search debouncing and cancellation, and fixed the CommonJS mock API compatibility issue.
- I verified the work with focused TypeScript checks, API tests, formatter tests, and drawer component tests.

## If I had another day

- Add browser tests for keyboard focus, mobile layout, and the two-tab stale-decision flow.
- Add runtime schema validation for API responses.
- Add server-side cursor pagination and a filter-metadata endpoint.
- I would add list virtualization so the browser renders only the rows currently visible on screen, improving rendering performance and keeping scrolling smooth when the queue grows to thousands of submissions.
- Add an audit history showing who made each decision and when.
