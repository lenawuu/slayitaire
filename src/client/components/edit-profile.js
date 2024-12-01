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

export const EditProfile = ({ currentUser }) => {
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    city: "",
  });
  const [error, setError] = useState("");

  let navigate = useNavigate();

  const fetchUser = (username) => {
    fetch(`/v1/user/${username}`)
      .then((res) => res.json())
      .then((data) => {
        setProfileData(data);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchUser(currentUser);
  }, []);

  const onChange = (ev) => {
    setError("");
    // Update from form and clear errors
    setProfileData({
      ...profileData,
      [ev.target.name]: ev.target.value,
    });
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    // Only proceed if there are no errors
    if (error !== "") return;
    const res = await fetch("/v1/user", {
      method: "PUT",
      body: JSON.stringify(profileData),
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
    });
    if (res.ok) {
      navigate(`/profile/${currentUser}`);
    } else {
      const err = await res.json();
      setError(err.error);
    }
  };

  return (
    <div style={{ gridArea: "main" }}>
      <ErrorMessage msg={error} />
      <FormBase>
        <FormLabel htmlFor="first_name">First Name:</FormLabel>
        <FormInput
          id="first_name"
          name="first_name"
          placeholder="First Name"
          onChange={onChange}
          value={profileData.first_name}
        />

        <FormLabel htmlFor="last_name">Last Name:</FormLabel>
        <FormInput
          id="last_name"
          name="last_name"
          placeholder="Last Name"
          onChange={onChange}
          value={profileData.last_name}
        />

        <FormLabel htmlFor="city">City:</FormLabel>
        <FormInput
          id="city"
          name="city"
          placeholder="City"
          onChange={onChange}
          value={profileData.city}
        />
        <div />
        <FormButton id="submitBtn" onClick={onSubmit}>
          Save Edits
        </FormButton>
      </FormBase>
    </div>
  );
};
