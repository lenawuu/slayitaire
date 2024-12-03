/* Copyright G. Hemingway, 2024 - All rights reserved */
"use strict";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ErrorMessage,
  FormBase,
  FormInput,
  FormLabel,
  FormButton,
  ModalNotify,
} from "./shared.js";
import { validPassword, validUsername } from "../../shared/index.js";

export const Register = () => {
  let navigate = useNavigate();
  let [username, setUsername] = useState("");
  let [city, setCity] = useState("");

  useEffect(() => {
    let accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      navigate("/");
    } else {
      getUserData();
    }

    async function getUserData() {
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
        setUsername(data.username);
      } catch (error) {
        console.error(error);
      }
    }

    document.getElementById("city").focus();
  }, []);

  const onChange = (ev) => {
    setCity(ev.target.value);
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    // Only proceed if there are no errors
    if (city === "") return;
    const res = await fetch("/v1/user", {
      method: "POST",
      body: JSON.stringify({
        username,
        city,
      }),
      credentials: "include",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (res.ok) {
      const jsonData = await res.json();
      if (jsonData.username) {
        navigate(`/success`);
      }
    } else {
      const err = await res.json();
      setError(err.error);
    }
  };

  return (
    <div style={{ gridArea: "main" }}>
      <p>What city are you from?</p>
      <FormBase>
        <FormLabel htmlFor="city">City:</FormLabel>
        <FormInput
          id="city"
          name="city"
          placeholder="City"
          onChange={onChange}
          value={city}
        />
        <div />
        <FormButton id="submitBtn" onClick={onSubmit}>
          Register
        </FormButton>
      </FormBase>
    </div>
  );
};

Register.propTypes = {};
