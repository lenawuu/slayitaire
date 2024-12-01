/* Copyright G. Hemingway, 2024 - All rights reserved */
"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const CardState = require("./card_state.cjs");

/***************** Move Model *******************/

/* Schema for an individual move of Klondike */
let Move = new Schema(
  {
    cards: { type: [CardState] },
    src: { type: String },
    dst: { type: String },
    date: { type: Date },
  },
  { _id: false }
);

Move.pre("validate", function (next) {
  this.start = Date.now();
  next();
});

module.exports = Move;
