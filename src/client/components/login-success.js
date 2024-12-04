import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// todo: add error handling for all fetches!
export const LoginSuccess = ({ logIn }) => {
  let navigate = useNavigate();

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const code = urlParams.get("code");

    if (code) {
      //   (code && localStorage.getItem("accessToken") === "undefined") ||
      //   localStorage.getItem("accessToken") === null
      // ) {
      async function getAccessToken() {
        await fetch(`http://slayitaire.click/v1/getAccessToken?code=${code}`)
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            console.log(data);
            if (data.access_token) {
              sessionStorage.setItem("accessToken", data.access_token);
            }
            getUserData();
          });
      }

      getAccessToken();
    }

    async function getUserData() {
      try {
        const response = await fetch("/v1/getUserData", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(response.statusText);
        }

        const username = data.username;

        const getSessionData = async () => {
          try {
            const res = await fetch("/v1/session", {
              body: JSON.stringify({
                username,
              }),
              method: "POST",
              credentials: "include",
              headers: {
                "content-type": "application/json",
                Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
              },
            });

            const data = await res.json();

            if (!res.ok) {
              if (data.error === "User not registered") {
                navigate("/register");
              } else {
                throw new Error(data.error);
              }
            } else if (res.ok) {
              logIn(username);
              navigate(`/profile/${username}`);
            }
          } catch (error) {
            console.error(error);
          }
        };

        getSessionData();
      } catch (error) {
        console.error(error);
      }
    }
  }, []);

  // change below whether registering or login
  return (
    <div>
      <h1>Login successful! </h1>
    </div>
  );
};
