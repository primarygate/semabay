# SEMA BAY — Muslim Marriage

Marriage section of the SEMA BAY platform: member discovery, profiles, join form, and **per-dater chat** (threads + messages).

## Run locally (browser testing)

```bash
npm start
```

Open [http://127.0.0.1:43127/marriage/](http://127.0.0.1:43127/marriage/).

How to try it:
1. Click **Create account** (top right) — choose a login ID + password
2. Open a member → **Chat with …** → send a message
3. Refresh → **Chats** — your thread is still there
4. **Join Today** also requires sign-in

## Login (required for services)

- Users create a **login ID** and **password** to use chat and join.
- Temporary accounts/sessions live in `data/chats.json` for browser testing.
- Your team can later replace this with a real database and auth system.

## Temporary storage (until your team adds a database)

- Chat threads/messages are **not** kept in the browser saver/`localStorage`.
- API: `/api/auth/*` and `/api/chats` — ready to point at a real DB later.

## Notes

- Sample member photos are for preview, not real members.
- Join applications still use browser storage until the member/approval system is connected.
- Parent-site chrome under `assets/` is stubbed so this section runs alone.
