'use strict';

console.log('Działa czat.js!');

const ws = new WebSocket('ws://localhost:3000');

const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBaton');
const messagesList = document.getElementById('messages');

ws.onopen = () => {
  console.log('Połączono z WebSocket');
};

ws.onmessage = (event) => {
  console.log('Otrzymano:', event.data);
  const li = document.createElement('li');
  li.textContent = event.data;
  messagesList.appendChild(li);
};

ws.onerror = (err) => {
  console.error('Błąd WebSocket:', err);
};

ws.onclose = () => {
  console.log('Rozłączono z WebSocket');
};

sendBtn.addEventListener('click', () => {
  const msg = msgInput.value;
  if (msg.trim() !== '') {
    ws.send(msg);
    msgInput.value = '';
  }
});
