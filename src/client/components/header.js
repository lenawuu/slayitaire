/* Copyright G. Hemingway, 2024 - All rights reserved */
"use strict";

import React, { Fragment, useEffect, useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Link } from "react-router-dom";
import md5 from "md5";

/**
 * @return {string}
 */
export function GravHash(email, size) {
  let hash = email && email.replace(/^\s\s*/, "").replace(/\s\s*$/, "");
  hash = hash && hash.toLowerCase();
  hash = hash && md5(hash);
  return `https://www.gravatar.com/avatar/${hash}?size=${size}`;
}

const fontColor = "#c4a1a1";

const HeaderLeftBase = styled.div`
  flex-grow: 1;
  font-style: italic;
  & > h2 {
    color: ${fontColor};
    margin: 0.75em 0 0.75em 0.5em;
  }
  & > a {
    text-decoration: none;
    & > h2 {
      color: ${fontColor};
      margin: 0.75em 0 0.75em 0.5em;
    }
  }
`;

const HeaderLeft = ({ user }) => {
  return (
    <HeaderLeftBase>
      {user !== "" ? (
        <Link to={`/`}>
          <h2>Slayitaire</h2>
        </Link>
      ) : (
        <h2>Slayitaire</h2>
      )}
    </HeaderLeftBase>
  );
};

HeaderLeft.propTypes = {
  user: PropTypes.string,
};

/*************************************************************************/

const HeaderRightBase = styled.div`
  display: flex;
  flex-direction: ${(props) => (props.$vertical ? "row" : "column")};
  justify-content: center;
  align-items: ${(props) => (props.$vertical ? "center" : "flex-end")};
  padding-right: 0.5em;
  & > a {
    color: ${fontColor};
    padding-right: ${(props) => (props.$vertical ? "0.5em" : "0")};
  }
`;

const CLIENT_ID = "Iv23liiWNCADHtB7RNC9";
function loginWithGithub() {
  window.location.assign(
    `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}`
  );
}

const HeaderRight = ({ user, email }) => {
  const isLoggedIn = user !== "";
  const [profilePic, setProfilePic] = useState("");

  useEffect(() => {
    if (isLoggedIn) {
      const accessToken = sessionStorage.getItem("accessToken");
      const fetchUserData = async () => {
        try {
          const res = await fetch("/v1/getUserData", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!res.ok) {
            throw new Error(res.statusText);
          }

          const data = await res.json();
          setProfilePic(data.profile_pic);
        } catch (error) {
          console.log(error);
        }
      };
      fetchUserData();
    }
  }, [isLoggedIn]);

  return (
    <HeaderRightBase $vertical={isLoggedIn}>
      {isLoggedIn ? (
        <Fragment>
          <Link to="/logout">Log Out</Link>
          <Link to={`/profile/${user}`}>
            <img
              style={{ borderRadius: "8px", width: "50px", height: "50px" }}
              src={profilePic}
            />
          </Link>
        </Fragment>
      ) : (
        <Fragment>
          <button onClick={loginWithGithub}>Github login</button>
        </Fragment>
      )}
    </HeaderRightBase>
  );
};

HeaderRight.propTypes = {
  user: PropTypes.string,
  email: PropTypes.string,
};

/*******************************************************************/

const HeaderBase = styled.div`
  grid-area: hd;
  display: flex;
  background: #000;
`;

export const Header = ({ user = "", email = "" }) => (
  <HeaderBase>
    <HeaderLeft user={user} />
    <HeaderRight user={user} email={email} />
  </HeaderBase>
);

Header.propTypes = {
  user: PropTypes.string,
  email: PropTypes.string,
};
