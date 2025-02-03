'use strict';

const expresik = require('express');
const router = expresik.Router();
const { szukajNotki, dodajNotke, pobierzNotatki, usunNotatke, edytujNotke } = require('../controllers/notesKontroler');
const { pobierzSession } = require("../controllers/authKontroler");

router.get("/session", pobierzSession);
router.get("/", pobierzNotatki);
router.post("/", dodajNotke);
router.delete("/:id", usunNotatke);
router.get("/search", szukajNotki);
router.put("/:id", edytujNotke);

module.exports = router;
