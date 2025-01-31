'use strict';
const jwt = require('jsonwebtoken');
const { rejestracja, logowanie } = require('../models/users');

const JWT_SECRET = process.env.JWT_SECRET || "gigasekret";

async function rejestracja2(req, res) {
    try {
        const { nick, haslo, rola } = req.body;
        if (!nick || !haslo || !rola) {
            return res.status(400).json({ message: 'Brak wymaganych danych' });
        }
        const nowyUser = await rejestracja(nick, haslo, rola);
        res.status(201).json({ id: nowyUser.id, nick: nowyUser.nick, rola: nowyUser.rola });
    }   catch (error) {
        res.status(400).json({ message: error.message });
    }
};

async function logowanie2(req, res) {
    try {
        const { nick, haslo } = req.body;
        if (!nick || !haslo) {
            return res.status(400).json({ message: 'Brak wymaganych danych' });
        }
        const user = await logowanie(nick, haslo);
        const token = jwt.sign({ id: user.id, nick: user.nick, rola: user.rola }, JWT_SECRET);
        res.status(200).json({ token });
    }   catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { rejestracja2, logowanie2 };