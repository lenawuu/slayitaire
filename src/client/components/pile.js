/* Copyright G. Hemingway, 2024 - All rights reserved */
"use strict";

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const CardImg = styled.img`
  position: absolute;
  height: auto;
  width: 100%;
`;

export const Card = ({ card, top, left, index, handleCardClick, clicked }) => {
  const source = card.up
    ? `/images/${card.value}_of_${card.suit}.png`
    : "/images/face_down.jpg";
  const style = { left: `${left}%`, top: `${top}%` };
  const id = `${card.suit}:${card.value}`;
  return (
    <CardImg
      id={id}
      style={{ ...style, border: clicked ? "solid 4px red" : "none" }}
      src={source}
      onClick={(e) => {
        e.stopPropagation();
        handleCardClick(index);
      }}
    />
  );
};

const PileBase = styled.div`
  margin: 5px;
  position: relative;
  display: inline-block;
  border: dashed 2px #808080;
  border-radius: 5px;
  width: 12%;
`;

const PileFrame = styled.div`
  margin-top: 140%;
`;

export const Pile = ({
  cards = [],
  spacing = 8,
  horizontal = false,
  up,
  onClick,
  clearClicked,
}) => {
  const [clicked, setClicked] = useState([]);

  useEffect(() => {
    if (clearClicked) {
      setClicked([]);
    }
  }, [clearClicked]);

  const handleCardClick = (index, cards) => {
    const targetCards = cards.slice(index);
    setClicked(targetCards.filter((card) => card.up));
    onClick(targetCards);
  };

  const children = cards.map((card, i) => {
    const top = horizontal ? 0 : i * spacing;
    const left = horizontal ? i * spacing : 0;
    return (
      <Card
        key={i}
        card={card}
        up={up}
        top={top}
        left={left}
        index={i}
        handleCardClick={(index) => handleCardClick(index, cards)}
        clicked={clicked.includes(card)}
      />
    );
  });
  return (
    <PileBase onClick={() => onClick()}>
      <PileFrame />
      {children}
    </PileBase>
  );
};

Pile.propTypes = {
  cards: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClick: PropTypes.func,
  horizontal: PropTypes.bool,
  spacing: PropTypes.number,
  maxCards: PropTypes.number,
  top: PropTypes.number,
  left: PropTypes.number,
};
