'use strict';

const { pool } = require("../config/bazadanych");

const dodajNotke = async (req, res) => {
  try {
      const { content } = req.body;
      const sessionId = req.cookies.sessionId;
      if (!sessionId) {
          return res.status(401).json({ message: "Brak sesji użytkownika" });
      }
      const userResult = await pool.query(
          "SELECT user_id FROM sessions WHERE id = $1",
          [sessionId]
      );
      if (userResult.rowCount === 0) {
          return res.status(401).json({ message: "Nie znaleziono sesji" });
      }
      const userId = userResult.rows[0].user_id;
      const result = await pool.query(
          "INSERT INTO notki (content, author_id) VALUES ($1, $2) RETURNING *",
          [content, userId]
      );
      res.status(201).json(result.rows[0]);
  } catch (error) {
      console.error("Błąd dodawania notatki:", error);
      res.status(500).json({ message: "Błąd serwera" });
  }
};


async function pobierzNotatki(req, res) {
  try {
    const result = await pool.query(`
      SELECT notki.id, notki.content, notki.created_at, users.nick AS author,
             (users.rola = 'admin') AS is_admin
      FROM notki
      JOIN users ON notki.author_id = users.id
      ORDER BY notki.created_at DESC
   `);

      res.status(200).json(result.rows);
  } catch (error) {
      console.error("Błąd pobierania notatek:", error);
      res.status(500).json({ message: "Błąd serwera" });
  }
};

const szukajNotki = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Brak zapytania' });
    }

    const result = await pool.query(
      "SELECT * FROM notki WHERE content ILIKE $1 ORDER BY created_at DESC",
      [`%${query}%`]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Oj coś poszło nie tak' });
  }
};

const usunNotatke = async (req, res) => {
  try {
    const { id } = req.params;
    const sessionId = req.cookies.sessionId;

    if (!sessionId) {
      return res.status(401).json({ message: "Brak sesji użytkownika" });
    }

    const sessionResult = await pool.query("SELECT user_id FROM sessions WHERE id = $1", [sessionId]);
    if (sessionResult.rowCount === 0) {
      return res.status(401).json({ message: "Nie znaleziono sesji" });
    }
    const userId = sessionResult.rows[0].user_id;

    const userResult = await pool.query("SELECT rola FROM users WHERE id = $1", [userId]);
    if (userResult.rowCount === 0) {
      return res.status(403).json({ message: "Nie znaleziono użytkownika" });
    }
    const rola = userResult.rows[0].rola;

    if (rola !== 'admin') {
      const noteResult = await pool.query("SELECT author_id FROM notki WHERE id = $1", [id]);
      if (noteResult.rowCount === 0 || noteResult.rows[0].author_id !== userId) {
        return res.status(403).json({ message: "Brak uprawnień do usunięcia notatki" });
      }
    }

    await pool.query("DELETE FROM notki WHERE id = $1", [id]);
    res.status(200).json({ message: "Notatka usunięta" });
  } catch (error) {
    console.error("Błąd podczas usuwania notatki:", error);
    res.status(500).json({ message: "Błąd serwera" });
  }
};


const edytujNotke = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const sessionId = req.cookies.sessionId;

    if (!sessionId) {
      return res.status(401).json({ message: "Brak sesji użytkownika" });
    }

    const sessionResult = await pool.query("SELECT user_id FROM sessions WHERE id = $1", [sessionId]);
    if (sessionResult.rowCount === 0) {
      return res.status(401).json({ message: "Nie znaleziono sesji" });
    }

    const userId = sessionResult.rows[0].user_id;

    const noteResult = await pool.query("SELECT author_id FROM notki WHERE id = $1", [id]);
    if (noteResult.rowCount === 0) {
      return res.status(404).json({ message: "Notatka nie istnieje" });
    }

    if (noteResult.rows[0].author_id !== userId) {
      return res.status(403).json({ message: "Brak uprawnień do edytowania tej notatki" });
    }

    await pool.query("UPDATE notki SET content = $1 WHERE id = $2", [content, id]);

    res.status(200).json({ message: "Notatka zaktualizowana" });
  } catch (error) {
    console.error("Błąd edycji notatki:", error);
    res.status(500).json({ message: "Błąd serwera" });
  }
};


module.exports = { szukajNotki, dodajNotke, pobierzNotatki, usunNotatke, edytujNotke };
