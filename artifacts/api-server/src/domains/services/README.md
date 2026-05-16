# `services` domain

Cross-cutting infrastructure shared by all game domains:

- `gameStore.ts` — in-memory store + long-poll change events + JSON-file
  persistence for crash recovery. Replacement with Supabase Postgres is tracked
  as a follow-up task.
- `auction.ts` — pure auction resolver shared between the server and the client
  auction modal.
