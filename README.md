# SEMA BAY — Muslim Marriage

Marriage section of the SEMA BAY platform: member discovery, profiles, join form, and **per-dater chat** (threads + messages).

## Run locally (browser testing)

```bash
npm start
```

Open [http://127.0.0.1:43127/marriage/](http://127.0.0.1:43127/marriage/).

How to try chat:
1. Open a member → **Chat with …**
2. Send a message (first message is a chat request)
3. Refresh the page → open **Chats** — the thread and messages are still there

## Temporary storage (until your team adds a database)

- Chat threads/messages are **not** kept in the browser saver/`localStorage`.
- For now they go through a small API into `data/chats.json` so you can test the UI in the browser.
- When the UI is finished, replace that file store with your real database — the client already talks to `/api/chats` and `/api/chats/:memberId`.

## Notes

- Sample member photos are for preview, not real members.
- Join applications still use browser storage until the member/approval system is connected.
- Parent-site chrome under `assets/` is stubbed so this section runs alone.
