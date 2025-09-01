
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import sanitizeHtml from 'sanitize-html';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// In-memory stores (for demo; use DB in production)
const usersById = new Map();        // socket.id -> { username, room }
const usernames = new Set();        // set of active usernames
const rooms = new Map();            // roomName -> Set(socket.id)

// Ensure a room exists
function ensureRoom(room) {
  if (!rooms.has(room)) rooms.set(room, new Set());
}
// Default room
ensureRoom('General');

function formatMessage(user, text) {
  return {
    user,
    text,
    ts: Date.now()
  };
}

function listRooms() {
  return Array.from(rooms.keys()).sort();
}

function leaveCurrentRoom(socket) {
  const info = usersById.get(socket.id);
  if (!info || !info.room) return;
  const set = rooms.get(info.room);
  if (set) {
    set.delete(socket.id);
    socket.leave(info.room);
    io.to(info.room).emit('system', { text: `${info.username} left`, ts: Date.now() });
    if (set.size === 0 && info.room !== 'General') {
      // optional: delete empty non-default rooms
      rooms.delete(info.room);
      io.emit('rooms:list', listRooms());
    }
  }
  usersById.set(socket.id, { ...info, room: null });
}

io.on('connection', (socket) => {
  // Send available rooms immediately
  socket.emit('rooms:list', listRooms());

  socket.on('auth:login', ({ username }, cb) => {
    if (typeof username !== 'string' || !username.trim()) {
      return cb?.({ ok: false, error: 'Username is required' });
    }
    const clean = username.trim().slice(0, 20);
    if (usernames.has(clean)) {
      return cb?.({ ok: false, error: 'Username already in use' });
    }
    usernames.add(clean);
    usersById.set(socket.id, { username: clean, room: null });
    cb?.({ ok: true, username: clean });
  });

  socket.on('room:create', ({ room }, cb) => {
    const info = usersById.get(socket.id);
    if (!info) return cb?.({ ok: false, error: 'Not authenticated' });
    if (typeof room !== 'string' || !room.trim()) {
      return cb?.({ ok: false, error: 'Room name required' });
    }
    const name = room.trim().slice(0, 30);
    ensureRoom(name);
    io.emit('rooms:list', listRooms());
    cb?.({ ok: true, room: name });
  });

  socket.on('room:join', ({ room }, cb) => {
    const info = usersById.get(socket.id);
    if (!info) return cb?.({ ok: false, error: 'Not authenticated' });
    if (!room || !rooms.has(room)) {
      return cb?.({ ok: false, error: 'Room does not exist' });
    }
    // leave old
    if (info.room) leaveCurrentRoom(socket);
    // join new
    rooms.get(room).add(socket.id);
    usersById.set(socket.id, { ...info, room });
    socket.join(room);
    io.to(room).emit('system', { text: `${info.username} joined`, ts: Date.now() });
    cb?.({ ok: true, room });
  });

  socket.on('msg:send', ({ text }, cb) => {
    const info = usersById.get(socket.id);
    if (!info || !info.room) {
      return cb?.({ ok: false, error: 'Join a room first' });
    }
    if (typeof text !== 'string') {
      return cb?.({ ok: false, error: 'Invalid message' });
    }
    const trimmed = text.trim();
    if (!trimmed) {
      return cb?.({ ok: false, error: 'Cannot send empty message' });
    }
    // Sanitize to avoid XSS; allow links, bold, italic tags since client formats
    const safe = sanitizeHtml(trimmed, { allowedTags: [], allowedAttributes: {} });
    const msg = formatMessage(info.username, safe);
    io.to(info.room).emit('msg:new', msg);
    cb?.({ ok: true });
  });

  socket.on('disconnect', () => {
    const info = usersById.get(socket.id);
    if (info) {
      if (info.room && rooms.has(info.room)) {
        const set = rooms.get(info.room);
        set.delete(socket.id);
        io.to(info.room).emit('system', { text: `${info.username} disconnected`, ts: Date.now() });
      }
      usernames.delete(info.username);
      usersById.delete(socket.id);
    }
  });
});

server.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
});
