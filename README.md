# SEMA BAY — Muslim Marriage

Plain **HTML / CSS / JS** marriage section. No npm and no Node server needed.

## Open in your browser

1. Download / open the `marriage` folder
2. Double-click **`marriage/index.html`**  
   (or right-click → Open with Chrome / Edge / Firefox)

That’s it.

## How to test

1. Top right → **Create account** (login ID + password)
2. Open a member → **Chat with …** → send a message
3. Refresh the page → **Chats** — the thread is still there
4. **Join Today** also needs sign-in

## Notes for your dev team later

- Accounts, sessions, and chat threads are stored in the browser for UI testing (`localStorage` via `assets/js/sb-store.js`).
- When the UI is finished, replace that store with your real database and login system.
- Sample member photos are for preview only.
