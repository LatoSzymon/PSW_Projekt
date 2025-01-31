"use strict";
require("dotenv").config();

const path = require("path");
const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");
const express = require("express");
const authSciezki = require("./src/routes/authSciezki");
const app = require("./src/config/server");

const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  console.log('Przychodzi żądanie:', req.url);
  next();
});
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use("/auth", authRoutes);

app.get('/', (req, res) => {
  res.send('<h1>Witaj!</h1><p>Możesz przejść do <a href="/czat">/czat</a> aby przetestować WebSocket</p>');
});

const notkiSzprotki = require("./src/routes/notesSciezki");
app.use("/notes", notkiSzprotki);
app.use('/demo', express.static(__dirname + '/demo'));

console.log(`Serwuję katalog statyczny: ${path.join(__dirname, "assets")}`);
fs.readdirSync(path.join(__dirname, "assets")).forEach((file) =>
  console.log(file)
);

app.get("/czat", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "test.html"));
});

app.get("/test-assets", (req, res) => {
  fs.readdir(path.join(__dirname, "assets/javascript"), (err, files) => {
    if (err) {
      console.error("Błąd odczytu katalogu:", err);
      return res.status(500).send("Błąd odczytu katalogu");
    }
    res.send(`Pliki w katalogu: ${files.join(", ")}`);
  });
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Nowy klient połączony');
  
    ws.on('message', (data) => {
      const message = data.toString();
      console.log('Odebrano wiadomość (tekst):', message);
  
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

server.listen(PORT, () => {
  console.log(`Serwer śmiga na porcie ${PORT}`);
});
