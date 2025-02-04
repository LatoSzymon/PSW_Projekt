"use strict";
require("dotenv").config();

const path = require("path");
const WebSocket = require("ws");
const express = require("express");
const app = require("./src/config/server");
const authSciezki = require("./src/routes/authSciezki");
const notkiSzprotki = require("./src/routes/notesSciezki");
const { pool } = require("./src/config/bazadanych");
const baza = require("./src/config/bazadanych");
const cookieParser = require("cookie-parser");
const https = require("https");
const fs = require("fs");

app.use(cookieParser());
const PORT = process.env.PORT || 3443;

baza.clearTables();

app.use(cookieParser());
app.use("/auth", authSciezki);
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/auth", authSciezki);
app.use("/notes", notkiSzprotki);

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

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "rejestracja.html"));
});

const certPath = "./src/certs";
const options = {
  key: fs.readFileSync(`${certPath}/localhost-key.pem`),
  cert: fs.readFileSync(`${certPath}/localhost.pem`),
};
const server = https.createServer(options, app);

const wss = new WebSocket.Server({ server });

wss.on("connection", async (ws, request) => {
  try {
      console.log("Nowe połączenie WebSocket");
      const cookies = request.headers.cookie;
      console.log("Ciasteczka:", cookies);

      if (!cookies) {
          console.error("Brak ciasteczek - zamykam połączenie");
          ws.close();
          return;
      }

      const sessionId = cookies
          ?.split("; ")
          .find((row) => row.startsWith("sessionId="))
          ?.split("=")[1];

      console.log("🔍 Otrzymane sessionId:", sessionId);

      if (!sessionId) {
          console.error("Brak sessionId - zamykam połączenie");
          ws.close();
          return;
      }

      const result = await pool.query("SELECT user_id FROM sessions WHERE id = $1", [sessionId]);

      if (result.rowCount === 0) {
          console.error("Nieprawidłowa sesja - zamykam połączenie");
          ws.close();
          return;
      }

      const userResult = await pool.query(
          "SELECT id, nick, rola FROM users WHERE id = $1",
          [result.rows[0].user_id]
      );

      if (userResult.rowCount === 0) {
          console.error("Nie znaleziono użytkownika - zamykam połączenie");
          ws.close();
          return;
      }

      ws.user = {
          userId: userResult.rows[0].id,
          nick: userResult.rows[0].nick,
          role: userResult.rows[0].rola,
      };

      ws.on("message", (data) => {
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

server.listen(PORT, () => {
  console.log(`Serwer śmiga na porcie ${PORT}`);
});
