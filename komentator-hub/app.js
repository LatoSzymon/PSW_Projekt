"use strict";
require("dotenv").config();

const path = require("path");
const http = require("http");
const WebSocket = require("ws");
const express = require("express");
const app = require("./src/config/server");
const authSciezki = require("./src/routes/authSciezki");
const notkiSzprotki = require("./src/routes/notesSciezki");
const { pool } = require("./src/config/bazadanych");
const baza = require("./src/config/bazadanych");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
const PORT = process.env.PORT || 3000;

baza.clearTables();

app.use(cookieParser());
// Middleware logujący żądania
app.use((req, res, next) => {
  console.log("Przychodzi żądanie:", req.url);
  next();
});

// Ścieżki statyczne i routy
app.use("/auth", authSciezki);
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/auth", authSciezki);
app.use("/notes", notkiSzprotki);

// Ścieżki do widoków HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "rejestracja.html"));
});

app.get("/czat", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "czat.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "logowanie.html"));
});

app.get("/main", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "main.html"));
});

app.get("/notki", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "notki.html"));
});

// Tworzenie serwera HTTP i WebSocket
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", async (ws, request) => {
  try {
      // Logowanie ciasteczek
      console.log("🚀 Nowe połączenie WebSocket");
      const cookies = request.headers.cookie;
      console.log("📋 Ciasteczka:", cookies);

      if (!cookies) {
          console.error("❌ Brak ciasteczek - zamykam połączenie");
          ws.close();
          return;
      }

      // Pobieranie sessionId z ciasteczek
      const sessionId = cookies
          ?.split("; ")
          .find((row) => row.startsWith("sessionId="))
          ?.split("=")[1];

      console.log("🔍 Otrzymane sessionId:", sessionId);

      if (!sessionId) {
          console.error("❌ Brak sessionId - zamykam połączenie");
          ws.close();
          return;
      }

      // Sprawdzenie sesji w bazie
      const result = await pool.query("SELECT user_id FROM sessions WHERE id = $1", [sessionId]);

      if (result.rowCount === 0) {
          console.error("❌ Nieprawidłowa sesja - zamykam połączenie");
          ws.close();
          return;
      }

      // Pobranie danych użytkownika
      const userResult = await pool.query(
          "SELECT id, nick, rola FROM users WHERE id = $1",
          [result.rows[0].user_id]
      );

      if (userResult.rowCount === 0) {
          console.error("❌ Nie znaleziono użytkownika - zamykam połączenie");
          ws.close();
          return;
      }

      ws.user = {
          userId: userResult.rows[0].id,
          nick: userResult.rows[0].nick,
          role: userResult.rows[0].rola,
      };

      console.log(`✅ Użytkownik ${ws.user.nick} połączony do WebSocket`);

      ws.on("message", (data) => {
        console.log(`📩 Odebrano wiadomość od ${ws.user.userId}: ${data}`);
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                const message = {
                    autorId: ws.user.userId,
                    autorNick: ws.user.nick,
                    rola: ws.user.role,
                    content: data.toString(),
                };
                client.send(JSON.stringify(message));
            }
        });
    });

      ws.on("close", () => {
          console.log(`Klient ${ws.user.nick} rozłączony`);
      });
  } catch (error) {
      console.error("Błąd WebSocket:", error);
      ws.close();
  }
});


// Start serwera
server.listen(PORT, () => {
  console.log(`Serwer śmiga na porcie ${PORT}`);
});
