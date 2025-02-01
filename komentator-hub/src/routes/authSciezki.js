'use strict';
const expresik = require('express');
const router = expresik.Router();
const { rejestracja2, logowanie2 } = require('../controllers/authKontroler');
const { pobierzSession } = require("../controllers/authKontroler");

router.get("/session", pobierzSession);
router.post('/register', rejestracja2);
router.post('/login', logowanie2);

module.exports = router;