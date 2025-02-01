'use strict';

const notatki = [{
    "id": "1685461234567",
    "title": "Notatka do usunięcia",
    "content": "Treść"
  }];

const dajNotki = (req, res) => {
  res.status(200).json(notatki);
};

const stworzNotki = (req, res) => {
  console.log(req.body);

  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'Coś jest nie tak z notatką' });
  }

  const nowaNota = { id: `${Date.now()}`, title, content };
  notatki.push(nowaNota);
  res.status(201).json(nowaNota);
};

const aktualizujNotki = (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  const notkaIndex = notatki.findIndex((n) => n.id === id);
  if (notkaIndex === -1) {
    return res.status(404).json({ message: 'Nie znaleziono notatki' });
  }

  notatki[notkaIndex] = { ...notatki[notkaIndex], title, content };
  res.status(200).json(notatki[notkaIndex]);
};

const usunNotki = (req, res) => {
    const { id } = req.params;
    const notkaIndex = notatki.findIndex((n) => n.id === id);

    if (notkaIndex === -1) {
        return res.status(404).json({ message: 'Nie znaleziono notatki' });
    }
    const usunietaNotka = notatki.splice(notkaIndex, 1);
    res.status(200).json(usunietaNotka);
};

const szukajNotki = (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ message: 'Brak zapytania' });
    }

    const wynik = notatki.filter((n) => n.title.includes(query));

    res.status(200).json(wynik);
};

module.exports = { dajNotki, stworzNotki, aktualizujNotki, usunNotki, szukajNotki };
