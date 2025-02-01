"use strict";
const { v4: uuidv4 } = require("uuid");
const { pool } = require("../config/bazadanych");

async function pobierzSession(req, res) {
    try {
        console.log("📡 Odebrano żądanie GET /auth/session");

        const sessionId = req.cookies.sessionId;
        console.log("🔍 Otrzymane sessionId:", sessionId);

        if (!sessionId) {
            console.warn("⚠️ Brak aktywnej sesji!");
            return res.status(401).json({ message: "Brak aktywnej sesji" });
        }

        const result = await pool.query("SELECT user_id FROM sessions WHERE id = $1", [sessionId]);
        if (result.rowCount === 0) {
            console.warn("⚠️ Nie znaleziono aktywnej sesji w bazie");
            return res.status(401).json({ message: "Nie znaleziono aktywnej sesji" });
        }

        res.status(200).json({ sessionId });
    } catch (error) {
        console.error("🔥 Błąd pobierania sesji:", error);
        res.status(500).json({ message: "Błąd serwera" });
    }
}

  

async function rejestracja2(req, res) {
    try {
      const { nick, haslo, rola } = req.body;
      console.log("Dane wejściowe:", nick, haslo, rola);
      if (!nick || !haslo || !rola) {
        return res.status(400).json({ message: "Brak wymaganych danych" });
      }
      const result = await pool.query(
        "INSERT INTO users (nick, haslo, rola) VALUES ($1, $2, $3) RETURNING *",
        [nick, haslo, rola]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Błąd rejestracji:", error);
      res.status(400).json({ message: error.message });
    }
  }
  

  async function logowanie2(req, res) {
    try {
        const { nick, haslo } = req.body;
        if (!nick || !haslo) {
            return res.status(400).json({ message: "Brak wymaganych danych" });
        }

        const user = await pool.query("SELECT * FROM users WHERE nick = $1", [nick]);
        if (user.rows.length === 0 || user.rows[0].haslo !== haslo) {
            return res.status(400).json({ message: "Nieprawidłowe dane logowania" });
        }

        const sessionId = uuidv4();
        await pool.query(
            "INSERT INTO sessions (id, user_id) VALUES ($1, $2)",
            [sessionId, user.rows[0].id]
        );

        // Dodanie ciasteczka
        res.cookie("sessionId", sessionId, { httpOnly: true, secure: false });
        res.status(200).json({ sessionId });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}


module.exports = { rejestracja2, logowanie2, pobierzSession };
