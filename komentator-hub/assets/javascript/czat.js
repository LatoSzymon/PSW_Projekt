"use strict";

// Najpierw pobierz sessionId z backendu
async function pobierzSessionId() {
  try {
      console.log("📡 Odebrano żądanie GET /auth/session");

      const response = await fetch("/auth/session");
      if (!response.ok) {
          console.warn("❌ Błąd pobierania sesji:", response.statusText);
          return null;
      }

      const data = await response.json();
      console.log("🔍 Otrzymane sessionId:", data.sessionId);
      return data.sessionId;
  } catch (error) {
      console.error("🔥 Błąd podczas pobierania sessionId:", error);
      return null;
  }
}


(async () => {
  const sessionId = await pobierzSessionId();
  if (!sessionId) return;
  console.log("Tworzę WebSocket z sessionId:", sessionId);

  const ws = new WebSocket(`ws://localhost:3000/czat?sessionId=${sessionId}`);
  const msgInput = document.getElementById("msgInput");
  const sendBtn = document.getElementById("sendBaton");
  const messagesList = document.getElementById("messages");

  ws.onopen = () => {
      console.log("Połączono z WebSocket");
  };

  ws.onmessage = (event) => {
    console.log("Otrzymano wiadomość z serwera:", event.data); // Log danych
    try {
        const data = JSON.parse(event.data);
        console.log("Sparsowane dane wiadomości:", data); // Log sparsowanych danych

        const li = document.createElement("li");
        li.textContent = `${data.autorNick} (${data.rola}): ${data.content}`;
        console.log("Dodano wiadomość do DOM:", li.textContent);
        messagesList.appendChild(li); // Dodaj do listy wiadomości
    } catch (error) {
        console.error("Błąd podczas parsowania danych wiadomości:", error);
    }
};


  ws.onerror = (err) => {
      console.error("Błąd WebSocket:", err);
  };

  ws.onclose = () => {
      console.log("Rozłączono z WebSocket");
      alert("Połączenie z serwerem zostało zakończone.");
  };

  sendBtn.addEventListener("click", () => {
      const msg = msgInput.value;
      if (msg.trim() !== "") {
          ws.send(msg);
          msgInput.value = "";
      }
  });
})();
