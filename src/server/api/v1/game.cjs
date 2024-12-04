/* Copyright G. Hemingway, 2024 - All rights reserved */
"use strict";

const Joi = require("joi");
const sanitized = require("sanitized");
const {
  initialState,
  shuffleCards,
  filterGameForProfile,
  filterMoveForResults,
} = require("../../solitare.cjs");
const { default: game } = require("../../models/game.cjs");

module.exports = (app) => {
  /**
   * Create a new game
   *
   * @param {req.body.game} Type of game to be played
   * @param {req.body.color} Color of cards
   * @param {req.body.draw} Number of cards to draw
   * @return {201 with { id: ID of new game }}
   */
  app.post("/v1/game", async (req, res) => {
    if (!req.session.user)
      return res.status(401).send({ error: "unauthorized" });

    // Schema for user info validation
    const schema = Joi.object({
      game: Joi.string().lowercase().required(),
      color: Joi.string().lowercase().required(),
      draw: Joi.any(),
    });
    // Validate user input
    try {
      const data = await schema.validateAsync(req.body, { stripUnknown: true });
      // Set up the new game
      let newGame = {
        owner: req.session.user._id,
        active: true,
        cards_remaining: 52,
        color: data.color,
        game: data.game,
        score: 0,
        start: Date.now(),
        winner: "",
        state: [],
        moves: [],
      };
      switch (data.draw) {
        case "Draw 1":
          newGame.drawCount = 1;
          break;
        case "Draw 3":
          newGame.drawCount = 3;
          break;
        default:
          newGame.drawCount = 1;
      }
      console.log(newGame);
      // Generate a new initial game state
      newGame.state = initialState();
      let game = new app.models.Game(newGame);
      try {
        await game.save();
        const query = { $push: { games: game._id } };
        // Save game to user's document too
        await app.models.User.findByIdAndUpdate(req.session.user._id, query);
        res.status(201).send({ id: game._id });
      } catch (err) {
        console.log(`Game.create save failure: ${err}`);
        res.status(400).send({ error: "failure creating game" });
        // TODO: Much more error management needs to happen here
      }
    } catch (err) {
      console.log(err);
      const message = err.details[0].message;
      console.log(`Game.create validation failure: ${message}`);
      res.status(400).send({ error: message });
    }
  });

  /**
   * Fetch game information
   *
   * @param (req.params.id} Id of game to fetch
   * @return {200} Game information
   */
  app.get("/v1/game/:id", async (req, res) => {
    try {
      let game = await app.models.Game.findById(req.params.id);
      if (!game) {
        res.status(404).send({ error: `unknown game: ${req.params.id}` });
      } else {
        const state = game.state.toJSON();
        const drawCount = { drawCount: game.drawCount };
        let results = filterGameForProfile(game);
        results.start = Date.parse(results.start);
        results.cards_remaining =
          52 -
          (state.stack1.length +
            state.stack2.length +
            state.stack3.length +
            state.stack4.length);
        // Do we need to grab the moves
        if (req.query.moves === "") {
          const moves = await app.models.Move.find({ game: req.params.id });
          state.moves = moves.map((move) => filterMoveForResults(move));
        }
        res.status(200).send(Object.assign({}, results, drawCount, state));
      }
    } catch (err) {
      console.log(`Game.get failure: ${err}`);
      res.status(404).send({ error: `unknown game: ${req.params.id}` });
    }
  });

  // Provide end-point to request shuffled deck of cards and initial state - for testing
  app.get("/v1/cards/shuffle", (req, res) => {
    res.send(shuffleCards(false));
  });
  app.get("/v1/cards/initial", (req, res) => {
    res.send(initialState());
  });

  // Game logic
  const validateMove = (move, gameState) => {
    const { src, dst, cards } = move;
    const convertToNumber = (value) => {
      const cardValues = {
        ace: 1,
        jack: 11,
        queen: 12,
        king: 13,
      };

      const number = Number(value);
      return isNaN(number) ? cardValues[value] : number;
    };

    if (src === dst) {
      throw new Error("source and destination cannot be the same");
    }

    const dstType = dst.replace(/\d+$/, "");
    const srcType = src.replace(/\d+$/, "");

    if (dstType === "discard") {
      if (srcType === "pile" || srcType === "stack")
        throw new Error("cannot move from pile/stack to discard");
    }

    // Moving to pile
    if (dstType === "pile") {
      const card = srcType === "discard" ? cards.at(-1) : cards[0];
      const pileCard = gameState[dst].at(-1);

      const cardColors = {
        hearts: "red",
        diamonds: "red",
        clubs: "black",
        spades: "black",
      };

      if (gameState[dst].length === 0) {
        if (card.value !== "king") {
          throw new Error("first card in pile must be a king");
        }
      } else {
        if (cardColors[card.suit] === cardColors[pileCard.suit]) {
          throw new Error("cannot place card on same color");
        }

        if (
          convertToNumber(card.value) !==
          convertToNumber(pileCard.value) - 1
        ) {
          throw new Error("card value must be one less than pile card");
        }
      }
    }

    // Moving to stack
    if (dstType === "stack") {
      if (gameState[dst].length === 0) {
        if (cards.at(-1).value !== "ace") {
          throw new Error("first card in stack must be an ace");
        }
      } else {
        const card = cards.at(-1);
        const stackCard = gameState[dst].at(-1);
        if (card.suit !== stackCard.suit) {
          throw new Error("cards in stack must be the same suit");
        }

        if (
          convertToNumber(card.value) !==
          convertToNumber(stackCard.value) + 1
        ) {
          throw new Error("cards in stack must be in ascending order");
        }

        gameState[dst].push(card);
        gameState[src].pop();

        if (srcType === "pile" && gameState[src].length > 0) {
          gameState[src].at(-1).up = true;
        }

        return gameState;
      }
    }

    // Drawing
    if (src === "draw") {
      if (gameState.draw.length === 0) {
        const drawPile = [];

        for (let i = 0; i < gameState.discard.length; i++) {
          const card = gameState.discard[i];
          card.up = false;
          drawPile.push(card);
        }

        gameState.draw = drawPile;
        gameState.discard = [];
        return gameState;
      }
    }

    if (src !== "discard") {
      cards.forEach((card) => {
        gameState[dst].push(card);
      });
    } else {
      gameState[dst].push(cards.at(-1));
    }

    // if (srcType === "pile" && dstType === "pile") {
    for (let i = 0; i < cards.length; i++) {
      gameState[src].pop();
    }
    // } else {
    //   gameState[src] = gameState[src].slice(0, -1);
    // }

    gameState[src].length > 0 && dstType !== "discard"
      ? (gameState[src].at(-1).up = true)
      : (gameState[dst].at(-1).up = true);

    return gameState;
  };

  app.post("/v1/game/:gameId", async (req, res) => {
    const move = sanitized(req.body);
    const gameId = req.params.gameId;

    let game = await app.models.Game.findById(gameId);
    if (!game) {
      res.status(404).send({ error: `unknown game: ${gameId}` });
    } else {
      const state = game.state.toJSON();
      try {
        const updated = validateMove(move, state);

        const toUpdate = await app.models.Game.findById(gameId);
        let writeMove = {
          cards: move.cards,
          src: move.src,
          dst: move.dst,
          date: Date.now(),
          player: req.session.user.username,
        };

        toUpdate.moves.push(writeMove);
        toUpdate.state.set(updated);

        await toUpdate.save();

        res.status(200).send(updated);
      } catch (validationError) {
        res.status(400).send({ error: validationError.message });
      }
    }
  });
};
