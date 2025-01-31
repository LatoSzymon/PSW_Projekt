"use strict";

const expresik = require("express");
const bodyParasite = require("body-parser");
const corsik = require("cors");

const app = expresik();

app.use(corsik());
app.use(bodyParasite.json());


module.exports = app;
