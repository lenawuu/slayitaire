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
  let [state, setState] = useState({
    primary_email: "",
    city: "",
  });
  let [showEmailInput, setShowEmailInput] = useState(true);
  let [error, setError] = useState("");

  useEffect(() => {
    let accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      navigate("/");
    } else {
      getUserData();
    }

    async function getUserData() {
      await fetch("/v1/getUserData", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          setUsername(data.login);

          if (data.email) {
            setShowEmailInput(false);
            setState({ primary_email: data.email });
          }
        });
    }

    document.getElementById("primary_email").focus();
  }, []);

  const onChange = (ev) => {
    setError("");
    // Update from form and clear errors
    setState({
      ...state,
      [ev.target.name]: ev.target.value,
    });
    // Make sure email is valid
    if (ev.target.name === "primary_email") {
      let emailInvalid = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ev.target.value);
      if (emailInvalid) setError(`Error: ${emailInvalid.error}`); // FIXME: display correct error message
    }
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    // Only proceed if there are no errors
    if (error !== "" || primary_email === "" || city === "") return;
    const res = await fetch("/v1/user", {
      method: "POST",
      body: JSON.stringify({
        username,
        primary_email: state.primary_email,
        city: state.city,
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
      <p>Register</p>
      <ErrorMessage msg={error} />
      <FormBase>
        {showEmailInput && (
          <div>
            <FormLabel htmlFor="primary_email">Email:</FormLabel>
            <FormInput
              id="primary_email"
              name="primary_email"
              type="email"
              placeholder="Email Address"
              onChange={onChange}
              value={state.primary_email}
            />
          </div>
        )}
        <FormLabel htmlFor="city">City:</FormLabel>
        <FormInput
          id="city"
          name="city"
          placeholder="City"
          onChange={onChange}
          value={state.city}
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
