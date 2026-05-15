# TeamDesk Lite

TeamDesk Lite is a lightweight team ticket system for tracking, triaging, resolving, and reviewing internal bugs, requests, and support issues.

The goal is to build a small local web application where a team can manage ticket status, assignees, comments, activity history, and basic dashboard statistics.

## Product Goals

- Team members can create tickets for bugs, requests, or support issues.
- Owners can review tickets and filter them by status, priority, tags, and assignee.
- Tickets follow an explicit status lifecycle instead of arbitrary status edits.
- Ticket detail pages show comments, system activities, and status history.
- The team can use a dashboard to understand ticket distribution and handling efficiency.

## Tech Stack

Recommended stack:

- Vite
- React
- TypeScript
- Node.js
- Express
- JSON file storage

The first version does not need a database, login system, permission model, or external services. Store data in local JSON files for easy development and verification.

## Running the App

Provide these commands:

```bash
npm install
npm run dev
npm run build
npm run test
```

Development mode should either start both frontend and backend, or clearly document how to start them separately.

## Core Concepts

### Ticket

A ticket is the main domain object. It represents a bug, request, or support issue.

Suggested type:

```ts
type TicketStatus = "open" | "triaged" | "in_progress" | "resolved" | "closed" | "reopened";
type TicketPriority = "low" | "medium" | "high" | "urgent";

type Ticket = {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
};
```

### Status History

Every status change should be recorded.

Suggested type:

```ts
type StatusHistoryItem = {
  id: string;
  ticketId: string;
  from: TicketStatus;
  to: TicketStatus;
  createdAt: string;
  note?: string;
};
```

### Comment

A comment is user-written discussion content. It should not directly change ticket status.

Suggested type:

```ts
type Comment = {
  id: string;
  ticketId: string;
  body: string;
  author: string;
  createdAt: string;
};
```

### Activity

An activity is a system-generated event, such as ticket creation, status changes, and assignee changes.

Suggested type:

```ts
type Activity = {
  id: string;
  ticketId: string;
  type: "ticket_created" | "status_changed" | "assignee_changed" | "comment_added";
  message: string;
  createdAt: string;
};
```

## Feature Scope

### 1. Ticket List

The list page should show:

- title
- status
- priority
- assignee
- tags
- updated time

The list page should support filtering by:

- status
- priority
- assignee
- tag

Filters can be combined.

### 2. Create Ticket

Users can create a ticket.

Required fields:

- title
- description
- priority

Optional fields:

- assignee
- tags

New tickets use `open` as the default status.

After successful creation:

- write the ticket to local JSON storage
- create a `ticket_created` activity
- navigate to the detail page, or show the new ticket in the list

### 3. Ticket Detail

The detail page should show:

- ticket metadata
- current status
- status history
- comments
- activity timeline

The detail page should support:

- updating priority
- updating assignee
- adding tags
- adding comments
- applying valid status transitions

### 4. Status Lifecycle

Status transitions must be validated.

Valid transitions:

```text
open -> triaged
triaged -> in_progress
in_progress -> resolved
resolved -> closed
resolved -> reopened
reopened -> in_progress
```

Invalid transitions should be rejected with a clear error message.

When status changes:

- update the current ticket status
- write status history
- write a `status_changed` activity
- set `resolvedAt` when the new status is `resolved`
- when status changes from `resolved` to `reopened`, clear or reinterpret `resolvedAt` to avoid incorrect statistics

### 5. Comments and Activity Timeline

Users can add comments on the ticket detail page.

When a comment is added:

- write the comment
- write a `comment_added` activity
- do not change ticket status

The activity timeline should be sorted consistently by time, either ascending or descending.

### 6. Dashboard Statistics

The dashboard should show:

- ticket count by status
- ticket count by priority
- tickets created in the last 7 days
- tickets resolved in the last 7 days
- average resolution time

Notes:

- reopened tickets should not continue to be counted as resolved
- average resolution time should be based on tickets that are truly resolved or closed
- if no data exists, show an empty state instead of crashing

## API Suggestions

Use this API shape:

```text
GET    /api/tickets
POST   /api/tickets
GET    /api/tickets/:id
PATCH  /api/tickets/:id
POST   /api/tickets/:id/transition
GET    /api/tickets/:id/comments
POST   /api/tickets/:id/comments
GET    /api/stats
```

Example request body for `POST /api/tickets/:id/transition`:

```json
{
  "to": "resolved",
  "note": "Fixed and verified locally."
}
```

Invalid status transitions should return 400.

Missing tickets should return 404.

## Pages

Suggested pages:

- `/`: redirect to ticket list
- `/tickets`: ticket list
- `/tickets/new`: create ticket
- `/tickets/:id`: ticket detail
- `/dashboard`: dashboard

The UI does not need to be complex, but it should be clear, usable, and reasonably information-dense.

## Development Stages

### Stage 0: Basic Tickets

Implement:

- ticket list
- create ticket
- ticket detail
- JSON persistence

Acceptance:

- users can create tickets
- the list shows created tickets
- data survives refresh or restart

### Stage 1: Status Lifecycle

Implement:

- valid status transition validation
- status history
- status change activity

Acceptance:

- valid transitions work
- invalid transitions are rejected
- the detail page shows status history

### Stage 2: Metadata and Filters

Implement:

- assignee
- priority
- tags
- combined filters

Acceptance:

- filter results are correct
- metadata updates do not break the status lifecycle

### Stage 3: Comments and Activity Timeline

Implement:

- add comments
- comment activity
- activity timeline

Acceptance:

- comments do not change status
- timeline display is stable

### Stage 4: Dashboard Statistics

Implement:

- count by status
- count by priority
- created / resolved trend for the last 7 days
- average resolution time

Acceptance:

- statistics match ticket data
- reopened tickets are not incorrectly counted as resolved

### Stage 5: Quality Pass

Implement:

- basic tests
- error states
- empty states
- simple loading states

Acceptance:

- core behavior has test coverage
- common errors do not crash the page

## Non-Goals

The first version should not include:

- login and permissions
- multi-tenancy
- email notifications
- file uploads
- external database
- real-time collaboration
- dedicated mobile adaptation

## Acceptance Checklist

The finished project should satisfy:

- users can create, view, filter, and update tickets
- status transitions are protected by rules
- comments, activities, and status history are displayed correctly
- the dashboard reflects current ticket data
- JSON data structure is clear and survives restart
- basic tests cover status transitions, filtering, and statistics
