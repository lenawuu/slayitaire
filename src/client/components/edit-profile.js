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
      <FormBase>
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
