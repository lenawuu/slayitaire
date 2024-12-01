/* Copyright G. Hemingway, 2024 - All rights reserved */
"use strict";

import React from "react";
import styled from "styled-components";

const LandingBase = styled.div`
  display: flex;
  justify-content: center;
  grid-area: main;
`;

export const Landing = () => (
  <LandingBase>
    <ul>
      <li>Edit profile</li>
      <li>Results</li>
      <li>Github Login?</li>
    </ul>
  </LandingBase>
);
