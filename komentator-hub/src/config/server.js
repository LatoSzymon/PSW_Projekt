"use strict";

const expresik = require("express");
const bodyParasite = require("body-parser");
const corsik = require("cors");

const app = expresik();

// Middleware
app.use(corsik());
app.use(bodyParasite.json());

// Nie dodajemy tu app.listen, ani tras typu app.get("/"), bo to zrobimy w `app.js`.

module.exports = app;
