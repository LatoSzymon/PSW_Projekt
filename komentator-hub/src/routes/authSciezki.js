'use strict';
const expresik = require('express');
const router = expresik.Router();
const { rejestracja2, logowanie2 } = require('../controllers/authKontroler');

router.post('/register', rejestracja2);
router.post('/login', logowanie2);

module.exports = router;