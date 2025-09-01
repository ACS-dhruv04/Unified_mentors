# Realtime Chat Application

A simple, room-based chat application built with **HTML, CSS, JavaScript** and **WebSockets (Socket.IO)**.

## Features
- Join with a **unique username** (prevents duplicates)
- Create and join **chat rooms**
- **Real-time** messaging with timestamps
- **Basic formatting**: `**bold**`, `*italic*`, and clickable `http(s)` links
- Auto-scroll, unread message indicator (in browser tab title)
- System messages for joins/leaves/disconnects
- Responsive UI

## Requirements
- Node.js 18+

## Getting Started
```bash
npm install
npm start
# open http://localhost:3000 in multiple tabs to test
```

## Project Structure
```
chat-app/
  public/
    index.html
    styles.css
    client.js
  server.js
  package.json
```

## Notes
- For demo purposes, all state is kept **in-memory** on the server — use a database for production.
- Message text is sanitized on the server and safely rendered on the client.

## Mapping to Assignment
This project implements the **UI, real-time communication, username auth, chat features, room management, and UX** specified in your PDF brief. See the assignment file for details.
