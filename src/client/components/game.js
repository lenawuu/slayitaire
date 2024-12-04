/* Copyright G. Hemingway, 2024 - All rights reserved */
"use strict";

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { Pile } from "./pile.js";

const CardRow = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: flex-start;
  margin-bottom: 2em;
`;

const CardRowGap = styled.div`
  flex-grow: 2;
`;

const GameBase = styled.div`
  grid-row: 2;
  grid-column: sb / main;
`;

export const Game = () => {
  const { id } = useParams();
  let [state, setState] = useState({
    pile1: [],
    pile2: [],
    pile3: [],
    pile4: [],
    pile5: [],
    pile6: [],
    pile7: [],
    stack1: [],
    stack2: [],
    stack3: [],
    stack4: [],
    draw: [],
    discard: [],
  });
  let [drawCount, setDrawCount] = useState(1);
  // let [target, setTarget] = useState(undefined);
  // let [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
  const [move, setMove] = useState(null);
  let [clearClicked, setClearClicked] = useState(false);

  useEffect(() => {
    const getGameState = async () => {
      const response = await fetch(`/v1/game/${id}`);
      const data = await response.json();
      setState({
        pile1: data.pile1,
        pile2: data.pile2,
        pile3: data.pile3,
        pile4: data.pile4,
        pile5: data.pile5,
        pile6: data.pile6,
        pile7: data.pile7,
        stack1: data.stack1,
        stack2: data.stack2,
        stack3: data.stack3,
        stack4: data.stack4,
        draw: data.draw,
        discard: data.discard,
      });
      setDrawCount(data.drawCount);
    };
    getGameState();
  }, [id]);

  useEffect(() => {
    const makeMove = async () => {
      try {
        const response = await fetch(`/v1/game/${id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(move),
        });
        const data = await response.json();
        if (data?.error) {
          throw new Error(data.error);
        }
        setState({
          pile1: data.pile1,
          pile2: data.pile2,
          pile3: data.pile3,
          pile4: data.pile4,
          pile5: data.pile5,
          pile6: data.pile6,
          pile7: data.pile7,
          stack1: data.stack1,
          stack2: data.stack2,
          stack3: data.stack3,
          stack4: data.stack4,
          draw: data.draw,
          discard: data.discard,
        });
      } catch (error) {
        console.error(error.message);
        setMove(null);
        setClearClicked(true);
      }
    };

    if (move?.src && move?.dst) {
      console.log(move);
      makeMove();
      setMove(null);
    }
  }, [move]);

  const handleMove = (data) => {
    const { loc, cards } = data;

    let userMove = {
      cards: [],
      src: "",
      dst: "",
    };

    if (loc === "draw") {
      userMove.src = "draw";
      userMove.dst = "discard";
      userMove.cards =
        state.draw.length >= drawCount
          ? state.draw.slice(-drawCount)
          : state.draw;

      setMove(userMove);
      return;
    }

    if (!data.cards && !move) {
      console.log("no cards");
      return;
    }

    if (!move) {
      userMove = {
        cards,
        src: loc,
        dst: "",
      };

      setMove(userMove);
    } else {
      setMove({ ...move, dst: loc });
    }
  };

  const clearMove = (e) => {
    if (e.target === e.currentTarget) {
      if (move) {
        console.log("clearing move");
        setMove(null);
        setClearClicked(true);
      }
    }
  };

  useEffect(() => {
    if (clearClicked) {
      setClearClicked(false);
    }
  }, [clearClicked]);

  return (
    <GameBase
      onClick={(e) => {
        clearMove(e);
      }}
    >
      <CardRow
        onClick={(e) => {
          clearMove(e);
        }}
      >
        <Pile
          cards={state.stack1}
          spacing={0}
          clearClicked={clearClicked}
          onClick={(cards) => {
            handleMove({ cards, loc: "stack1" });
          }}
        />
        <Pile
          cards={state.stack2}
          spacing={0}
          clearClicked={clearClicked}
          onClick={(cards) => {
            handleMove({ cards, loc: "stack2" });
          }}
        />
        <Pile
          cards={state.stack3}
          spacing={0}
          clearClicked={clearClicked}
          onClick={(cards) => {
            handleMove({ cards, loc: "stack3" });
          }}
        />
        <Pile
          cards={state.stack4}
          spacing={0}
          clearClicked={clearClicked}
          onClick={(cards) => {
            handleMove({ cards, loc: "stack4" });
          }}
        />
        <CardRowGap />
        <Pile
          cards={state.draw}
          spacing={0}
          clearClicked={clearClicked}
          onClick={(cards) => {
            handleMove({ loc: "draw", cards });
          }}
        />
        <Pile
          cards={state.discard}
          spacing={0}
          clearClicked={clearClicked}
          onClick={(cards) => {
            handleMove({ loc: "discard", cards });
          }}
        />
      </CardRow>
      <CardRow
        onClick={(e) => {
          clearMove(e);
        }}
      >
        <Pile
          cards={state.pile1}
          clearClicked={clearClicked}
          onClick={(cards) => {
            handleMove({ loc: "pile1", cards });
          }}
        />
        <Pile
          cards={state.pile2}
          clearClicked={clearClicked}
          onClick={(cards) => {
            handleMove({ loc: "pile2", cards });
          }}
        />
        <Pile
          cards={state.pile3}
          clearClicked={clearClicked}
          onClick={(cards) => {
            handleMove({ loc: "pile3", cards });
          }}
        />
        <Pile
          cards={state.pile4}
          clearClicked={clearClicked}
          onClick={(cards) => {
            handleMove({ loc: "pile4", cards });
          }}
        />
        <Pile
          cards={state.pile5}
          clearClicked={clearClicked}
          onClick={(cards) => {
            handleMove({ loc: "pile5", cards });
          }}
        />
        <Pile
          cards={state.pile6}
          clearClicked={clearClicked}
          onClick={(cards) => {
            handleMove({ loc: "pile6", cards });
          }}
        />
        <Pile
          cards={state.pile7}
          clearClicked={clearClicked}
          onClick={(cards) => {
            handleMove({ loc: "pile7", cards });
          }}
        />
      </CardRow>
    </GameBase>
  );
};

Game.propTypes = {};
