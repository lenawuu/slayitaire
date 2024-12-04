/* Copyright G. Hemingway, 2024 - All rights reserved */
"use strict";

import React, { Fragment, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import { GravHash } from "./header.js";
import { GameList } from "./game-list.js";
import {
  ErrorMessage,
  InfoBlock,
  InfoData,
  InfoLabels,
  ShortP,
} from "./shared.js";

const ProfileBlockBase = styled.div`
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: auto;
  grid-template-areas: "pic" "profile";
  padding: 1em;

  @media (min-width: 500px) {
    grid-template-columns: auto 1fr;
    grid-template-areas: "pic profile";
    padding: 2em;
  }
`;

const ProfileImage = styled.img`
  grid-area: pic;
  max-width: 150px;
  padding: 1em;
  border-radius: 10%;
  @media (min-width: 500px) {
    padding: 0.5em;
    max-width: 200px;
  }
`;

const ProfileBlock = (props) => {
  return (
    <ProfileBlockBase>
      <ProfileImage src={props.profile_pic} />
      <InfoBlock>
        <InfoLabels>
          <p>Username:</p>
          <p>First Name:</p>
          <p>Last Name:</p>
          <p>City:</p>
          <p>Email Address:</p>
        </InfoLabels>
        <InfoData>
          <ShortP>{props.username}</ShortP>
          <ShortP>{props.first_name}</ShortP>
          <ShortP>{props.last_name}</ShortP>
          <ShortP>{props.city}</ShortP>
          <ShortP>{props.primary_email}</ShortP>
        </InfoData>
      </InfoBlock>
    </ProfileBlockBase>
  );
};

const EditLinkBase = styled.div`
  grid-area: sb;
  display: none;
  & > a {
    cursor: not-allowed;
  }
  @media (min-width: 500px) {
    display: inherit;
  }
`;

const EditLink = ({ show }) => {
  return show ? (
    <EditLinkBase>
      <Link to="/edit">Edit Profile</Link>
    </EditLinkBase>
  ) : null;
};

const ProfileBase = styled.div`
  grid-area: main;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const Profile = (props) => {
  const { username } = useParams();
  let [state, setState] = useState({
    username: "",
    first_name: "",
    last_name: "",
    primary_email: "",
    city: "",
    games: [],
    error: "",
    profile_pic: "",
  });

  async function getUserData() {
    await fetch("/v1/getUserData", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        const profilePic = data.profile_pic;
        setState((state) => ({ ...state, profile_pic: profilePic }));
        return data;
      });
  }

  const fetchUser = (username) => {
    fetch(`/v1/user/${username}`)
      .then((res) => res.json())
      .then((data) => {
        setState(data);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchUser(username);
    getUserData();
  }, [username]);

  // Is the logged-in user viewing their own profile
  const isUser = state.username === props.currentUser;
  return (
    <Fragment>
      <EditLink show={isUser} profileState={state} />
      <ProfileBase>
        <ErrorMessage msg={state.error} hide={true} />
        <ProfileBlock {...state} />
        <GameList toCreateGame={isUser} games={state.games} />
      </ProfileBase>
    </Fragment>
  );
};

Profile.propTypes = {
  gridPlacement: PropTypes.string,
  user: PropTypes.string,
};
