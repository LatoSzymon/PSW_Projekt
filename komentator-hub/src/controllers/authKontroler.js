"use strict";
const { v4: uuidv4 } = require("uuid");
const { pool } = require("../config/bazadanych");

const pobierzSession = async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        if (!sessionId) {
            return res.status(401).json({ message: "Brak aktywnej sesji" });
        }
        const result = await pool.query(
            "SELECT user_id FROM sessions WHERE id = $1",
            [sessionId]
        );
        if (result.rowCount === 0) {
            return res.status(401).json({ message: "Nie znaleziono sesji" });
        }
        res.status(200).json({ sessionId });
    } catch (error) {
        console.error("Błąd pobierania sesji:", error);
        res.status(500).json({ message: "Błąd serwera" });
    }
};


const wyloguj = async (req, res) => {
    try {
        res.clearCookie("sessionId");
        const result = await pool.query(
            "DELETE FROM sessions WHERE id = $1",
            [req.cookies.sessionId]
        );
        console.log("Sesja wyczyszczona:", result.rowCount);
        res.status(200).json({ message: "Wylogowano pomyślnie" });
    } catch (error) {
        console.error("Błąd podczas wylogowania:", error);
        res.status(500).json({ message: "Błąd serwera" });
    }
};

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
  

const logowanie2 = async (req, res) => {
    try {
        const { nick, haslo } = req.body;
        const result = await pool.query(
            "SELECT id FROM users WHERE nick = $1 AND haslo = $2",
            [nick, haslo]
        );
        if (result.rowCount === 0) {
            return res.status(401).json({ message: "Nieprawidłowe dane logowania" });
        }
        const sessionId = uuidv4();
        await pool.query(
            "INSERT INTO sessions (id, user_id) VALUES ($1, $2)",
            [sessionId, result.rows[0].id]
        );
        res.cookie('sessionId', sessionId, { httpOnly: true });
        res.status(200).json({ message: "Zalogowano" });
    } catch (error) {
        console.error("Błąd logowania:", error);
        res.status(500).json({ message: "Błąd serwera" });
    }
};

const pobierzDaneUzytkownika = async (req, res) => {
    try {
      const sessionId = req.query.sessionId;
  
      if (!sessionId) {
        return res.status(401).json({ message: "Brak sesji użytkownika" });
      }
  
      const sessionResult = await pool.query("SELECT user_id FROM sessions WHERE id = $1", [sessionId]);
      if (sessionResult.rowCount === 0) {
        return res.status(401).json({ message: "Nie znaleziono sesji" });
      }
  
      const userResult = await pool.query("SELECT nick, rola FROM users WHERE id = $1", [sessionResult.rows[0].user_id]);
  
      if (userResult.rowCount === 0) {
        return res.status(404).json({ message: "Użytkownik nie istnieje" });
      }
  
      res.status(200).json(userResult.rows[0]);
    } catch (error) {
      console.error("Błąd pobierania użytkownika:", error);
      res.status(500).json({ message: "Błąd serwera" });
    }
  };
  


module.exports = { rejestracja2, logowanie2, pobierzSession, wyloguj, pobierzDaneUzytkownika };
