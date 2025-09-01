const socket = io();

// Elements
const modal = document.getElementById('modal');
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('usernameInput');
const currentUserEl = document.getElementById('currentUser');
const roomListEl = document.getElementById('roomList');
const createRoomForm = document.getElementById('createRoomForm');
const newRoomInput = document.getElementById('newRoomInput');
const roomTitle = document.getElementById('roomTitle');
const roomHint = document.getElementById('roomHint');
const leaveBtn = document.getElementById('leaveBtn');
const messages = document.getElementById('messages');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');

let currentUser = null;
let currentRoom = null;
let unread = 0;
let windowFocused = true;
const origTitle = document.title;

window.addEventListener('focus', () => { windowFocused = true; unread = 0; document.title = origTitle; });
window.addEventListener('blur', () => { windowFocused = false; });

// --- Helpers ---
const esc = (s) => s.replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function formatText(s) {
  // basic formatting: **bold**, *italic*, links
  let out = esc(s);
  // links
  out = out.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  // bold **text**
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // italic *text*
  out = out.replace(/\*(.+?)\*/g, '<em>$1</em>');
  return out;
}
const time = (ts) => new Date(ts).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

function addMessage({ user, text, ts }, isMe=false) {
  const wrap = document.createElement('div');
  wrap.className = 'msg' + (isMe ? ' me' : '');
  wrap.innerHTML = `<div class="meta">${esc(user)} • ${time(ts)}</div><div class="text">${formatText(text)}</div>`;
  messages.appendChild(wrap);
  messages.scrollTop = messages.scrollHeight;
  if (!windowFocused && !isMe) {
    unread += 1;
    document.title = `(${unread}) ${origTitle}`;
  }
}
function addSystem({ text, ts }) {
  const div = document.createElement('div');
  div.className = 'system';
  div.textContent = `${text} • ${time(ts)}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function setRoomTitle(name) {
  roomTitle.textContent = name ? `# ${name}` : 'Select a room';
  roomHint.textContent = name ? '' : 'Create or pick a room to start chatting';
  leaveBtn.disabled = !name;
}

// --- Auth ---
modal.classList.remove('hidden');
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  if (!username) return;
  socket.emit('auth:login', { username }, (res) => {
    if (!res.ok) return alert(res.error);
    currentUser = res.username;
    currentUserEl.textContent = currentUser;
    modal.classList.add('hidden');
  });
});

// --- Rooms ---
socket.on('rooms:list', (rooms) => {
  roomListEl.innerHTML = '';
  rooms.forEach(r => {
    const li = document.createElement('li');
    li.textContent = r;
    li.className = (r === currentRoom) ? 'active' : '';
    li.addEventListener('click', () => joinRoom(r));
    roomListEl.appendChild(li);
  });
});

createRoomForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = newRoomInput.value.trim();
  if (!name) return;
  socket.emit('room:create', { room: name }, (res) => {
    if (!res.ok) return alert(res.error);
    newRoomInput.value = '';
    joinRoom(res.room);
  });
});

function joinRoom(name) {
  if (!currentUser) return alert('Choose a username first');
  socket.emit('room:join', { room: name }, (res) => {
    if (!res.ok) return alert(res.error);
    currentRoom = name;
    messages.innerHTML = ''; // clear chat history (no persistence in demo)
    setRoomTitle(currentRoom);
    // refresh active state
    Array.from(roomListEl.children).forEach(li => li.classList.toggle('active', li.textContent === name));
  });
}

leaveBtn.addEventListener('click', () => {
  // client-side leave (server will handle on next join); here we just clear UI
  currentRoom = null;
  setRoomTitle(null);
});

// --- Messaging ---
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = messageInput.value;
  if (!text.trim()) return;
  if (!currentRoom) return alert('Join a room first');
  socket.emit('msg:send', { text }, (res) => {
    if (!res.ok) return alert(res.error);
    // Optimistic render
    addMessage({ user: currentUser, text, ts: Date.now() }, true);
    messageInput.value = '';
    messageInput.focus();
  });
});

socket.on('msg:new', (msg) => addMessage(msg, msg.user === currentUser));
socket.on('system', (info) => addSystem(info));
