'use strict';

const bcrypt = require('bcryptjs');
let uzytkownicy = [];

async function rejestracja(nick, haslo, rola) {
    if (uzytkownicy.find(u => u.nick === nick)) {
        throw new Error('Taki użytkownik już istnieje');
    }
    const hashoHaslo = await bcrypt.hash(haslo, 8);
    const nowyUser = {
        id: Date.now().toString(),
        nick,
        password: hashoHaslo,
        rola
    };
    uzytkownicy.push(nowyUser);
    return nowyUser;
};

async function logowanie(nick, haslo) {
    const user = uzytkownicy.find(u => u.nick === nick);
    if (!user) {
        throw new Error('Niepoprawne dane logowania');
    }
    const hasloPoprawne = await bcrypt.compare(haslo, user.password);
    if (!hasloPoprawne) {
        throw new Error('Niepoprawne dane logowania');
    }
    return user;
};

module.exports = { uzytkownicy, rejestracja, logowanie };