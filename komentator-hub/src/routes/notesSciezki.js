'use strict';

const expresik = require('express');
const router = expresik.Router();
const { dajNotki, stworzNotki, aktualizujNotki, usunNotki, szukajNotki } = require('../controllers/notesKontroler');

router.get('/', dajNotki);
router.post('/', stworzNotki);
router.put('/:id', aktualizujNotki);
router.delete('/:id', usunNotki);
router.get('/search', szukajNotki);

module.exports = router;
