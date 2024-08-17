import React, { useState } from "react";
// import CompanyInfo from '../../Components/User/CompanyInfo';
import PersonalInfo from "../../../Components/User/PersonalInfo";
import AccountInfo from "../../../Components/User/AccountInfo";
import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

const RegistrationForm = () => {
  let navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  console.log("🚀 ~ RegistrationForm ~ formData:", formData)

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const submitForm = async () => {
    const allFormData = JSON.parse(localStorage.getItem("formData")) || {};
    const combinedData = { ...allFormData, ...formData };
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/user/registration/register`, combinedData);
      message.info("Check your mail inbox, Verify your email");
      const role = localStorage.getItem("role");
      navigate("/thank-you")
      // console.log('Form data sent successfully!');
    } catch (error) {
      message.error("A Client already exists with the email");
    }

    setFormData({});
    setStep(1);
    localStorage.removeItem("formData");
  };

  switch (step) {
    case 1:
      return (
        <PersonalInfo
          formData={formData}
          setFormData={setFormData}
          prevStep={prevStep}
          nextStep={nextStep}
        />
      );
    case 2:
      return (
        <AccountInfo
          formData={formData}
          setFormData={setFormData}
          prevStep={prevStep}
          submitForm={submitForm}
        />
      );

    default:
      return null;
  }
};

export default RegistrationForm;
