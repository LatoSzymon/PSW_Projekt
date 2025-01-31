"use strict";
require("dotenv").config();

const path = require("path");
const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");
const express = require("express"); // dodatkowo, bo korzystamy z express.static

// 1. Import aplikacji Express z server.js
const app = require("./src/config/server");

// 2. Inicjalizacja i konfiguracja
const PORT = process.env.PORT || 3000;

// Debug: pokaż żądania URL (opcjonalnie)
app.use((req, res, next) => {
  console.log("URL:", req.url);
  next();
});

// Serwowanie plików statycznych z /assets
app.use(express.static(path.join(__dirname, "assets")));

app.get('/', (req, res) => {
  res.send('<h1>Witaj!</h1><p>Możesz przejść do <a href="/czat">/czat</a> aby przetestować WebSocket</p>');
});

// Tutaj dołączasz swoje routery z CRUD (notesSciezki) etc.
const notkiSzprotki = require("./src/routes/notesSciezki");
app.use("/notes", notkiSzprotki);

// Testowe logi:
console.log(`Serwuję katalog statyczny: ${path.join(__dirname, "assets")}`);
fs.readdirSync(path.join(__dirname, "assets")).forEach((file) =>
  console.log(file)
);

// 3. Trasa do testu (plik HTML z czatem)
app.get("/czat", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "test.html"));
});

// Inna trasa testowa, żeby sprawdzić zawartość /assets/js
app.get("/test-assets", (req, res) => {
  fs.readdir(path.join(__dirname, "assets/javascript"), (err, files) => {
    if (err) {
      console.error("Błąd odczytu katalogu:", err);
      return res.status(500).send("Błąd odczytu katalogu");
    }
    res.send(`Pliki w katalogu: ${files.join(", ")}`);
  });
});

// 4. Tworzymy serwer HTTP na bazie `app` i WebSocket
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 5. WebSocket – obsługa zdarzeń
wss.on('connection', (ws) => {
    console.log('Nowy klient połączony');
  
    ws.on('message', (data) => {
      // data to Buffer, zamieniamy na zwykły tekst:
      const message = data.toString();
      console.log('Odebrano wiadomość (tekst):', message);
  
      // Rozsyłamy do wszystkich klientów w formie stringa
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          console.log(`Wysyłam wiadomość: "${message}" do klienta`);
          client.send(message);
        }
      });
    });
  
    ws.on('close', () => {
      console.log('Klient rozłączony');
    });
  });

// 6. Uruchamiamy serwer na porcie
server.listen(PORT, () => {
  console.log(`Serwer śmiga na porcie ${PORT}`);
});
