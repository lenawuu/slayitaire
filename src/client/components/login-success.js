import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const LoginSuccess = () => {
  const [rerender, setRerender] = useState(false);
  let navigate = useNavigate();

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const code = urlParams.get("code");

    if (code && localStorage.getItem("accessToken") === null) {
      async function getAccessToken() {
        await fetch(`http://localhost:8080/v1/getAccessToken?code=${code}`)
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            console.log(data);
            if (data.accessToken) {
              localStorage.setItem("accessToken", data.accessToken);
              setRerender(!rerender);
            }
          });
      }

      getAccessToken();
    }

    async function getUserData() {
      await fetch("/v1/getUserData", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          console.log(data);

          const fetchProfile = async ({ username }) => {
            let res = await fetch("/v1/session", {
              body: JSON.stringify({
                username,
              }),
              method: "POST",
              credentials: "include",
              headers: {
                "content-type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            });
            const data = await res.json();
            if (res.ok) {
              props.logIn(data.login);
              navigate(`/profile/${data.login}`);
            } else {
              console.error(data.error);
              // see what error is when logging in without registering
              navigate(`/register`);
            }
          };

          fetchProfile(data.login);
        });
    }

    try {
      getUserData();
    } catch (error) {}
  });

  // change below whether registering or login
  return (
    <div>
      <h1>Login successful! </h1>
    </div>
  );
};
