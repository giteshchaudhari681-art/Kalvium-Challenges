## Investigation Notes

Date: 2026-05-21
Challenge: `Milestone 06/Access Denied, Apparently`

### Accounts used

- Account A created events.
- Account B was invited to one event and not invited to another.

### Findings before fixes

1. Unauthorized event discovery
- `GET /api/events` returned every event in memory instead of only events the current user created or was invited to.
- Evidence: after Account A created one shared event and one private event, the raw response for Account B included both titles, including the private event that had an empty `invitedEmails` list.
- Risk: any authenticated user can enumerate all private events and harvest IDs for follow-on abuse.

2. Private detail disclosure
- `GET /api/events/:id` returned full event details for an event Account B was not invited to.
- Evidence: requesting Account A's private event ID as Account B returned the event payload with `isCreator: false` and `isInvited: false` instead of rejecting access.
- Risk: event title, description, date, guest list, and RSVP metadata are exposed to unauthorized users.

3. RSVP gatekeeping bypass
- `POST /api/events/:id/rsvp` accepted RSVP requests from users who were not invited.
- The same user could RSVP multiple times because duplicate entries were appended to `rsvps`.
- Evidence: Account B successfully RSVPed to Account A's private event, then repeated the call and the RSVP count increased again.
- Risk: unauthorized attendance, corrupted RSVP counts, and trivial abuse of invite-only events.

4. Unauthorized data deletion
- `DELETE /api/events/:id` deleted events without checking ownership.
- Evidence: Account B deleted Account A's private event successfully.
- Risk: any authenticated user can remove arbitrary events from the system.

5. Misleading UI
- `client/src/pages/EventDetail.jsx` rendered RSVP and Delete buttons for any logged-in user after the event detail loaded.
- The page computed `hasRSVPed` but did not use permission flags to decide whether to render actions.
- Risk: the interface suggests unauthorized actions are allowed and directly exposes dangerous backend endpoints to normal users.
