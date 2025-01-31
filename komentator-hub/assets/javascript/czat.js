'use strict';

console.log('Działa czat.js!');

// Nawiązanie połączenia WebSocket
const ws = new WebSocket('ws://localhost:3000');

const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');
const messagesList = document.getElementById('messages');

// Po otwarciu połączenia
ws.onopen = () => {
  console.log('Połączono z WebSocket');
};

// Gdy przyjdzie wiadomość
ws.onmessage = (event) => {
  console.log('Otrzymano:', event.data);
  const li = document.createElement('li');
  li.textContent = event.data;
  messagesList.appendChild(li);
};

// Gdy nastąpi błąd
ws.onerror = (err) => {
  console.error('Błąd WebSocket:', err);
};

// Po zamknięciu
ws.onclose = () => {
  console.log('Rozłączono z WebSocket');
};

// Wysyłanie wiadomości
sendBtn.addEventListener('click', () => {
  const msg = msgInput.value;
  if (msg.trim() !== '') {
    ws.send(msg);
    msgInput.value = '';
  }
});