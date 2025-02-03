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
    const userId = req.session.userId;

    const user = await pool.query("SELECT rola FROM users WHERE id = $1", userId);
    if (user.rows[0].rola !== 'admin' || user.rows.length === 0) {
      alert("Brak uprawnień do usuwania notatki");
      return res.status(403).json({ message: 'Brak uprawnień' });
    }

    await pool.query("DELETE FROM notki WHERE id = $1", [id]);
    res.status(200).json({ message: 'Notatka usunięta' });
  } catch (error) {
    console.error('Błąd usuwania notatki', error.message);
    res.status(500).json({ message: 'Oj coś poszło nie tak' });
  }
};

module.exports = { szukajNotki, dodajNotke, pobierzNotatki, usunNotatke };
