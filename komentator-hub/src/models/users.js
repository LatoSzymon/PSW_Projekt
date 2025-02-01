'use strict';

const bcrypt = require('bcryptjs');
const pool = require('../config/bazadanych');

async function rejestracja(nick, haslo, rola) {
  const istnieje = await pool.query('SELECT * FROM users WHERE nick = $1', [nick]);

  if (istnieje.rowCount > 0) {
    throw new Error('Taki użytkownik już istnieje');
  }

  const hasloHashed = await bcrypt.hash(haslo, 8);

  const nowyUser = await pool.query(
    'INSERT INTO users (nick, password, rola) VALUES ($1, $2, $3) RETURNING id, nick, rola',
    [nick, hasloHashed, rola]
  );

  return nowyUser.rows[0];
}

async function logowanie(nick, haslo) {
    const result = await pool.query('SELECT * FROM users WHERE nick = $1', [nick]);
  
    if (result.rowCount === 0) {
      throw new Error('Nieprawne dane logowania');
    }
  
    const user = result.rows[0];
    const hasloPoprawne = await bcrypt.compare(haslo, user.haslo);
  
    if (!hasloPoprawne) {
      throw new Error('Nieprawne dane logowania');
    }
  
    return user;
  }
  

module.exports = { rejestracja, logowanie };
