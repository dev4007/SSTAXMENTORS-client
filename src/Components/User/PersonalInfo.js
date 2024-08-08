import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const PersonalInfo = ({ formData, setFormData, nextStep }) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    // Initialize formData.country with "India" if it's not already set
    if (!formData.country) {
      setFormData({ ...formData, country: "India" });
    }
  }, []);

  const saveDataAndProceed = () => {
    localStorage.setItem("formData", JSON.stringify(formData));
    nextStep();
  };

  // Array of states in India
  const statesInIndia = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ].sort(); // Sort states in alphabetical order

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="max-w-2xl w-full bg-white p-8 rounded-md shadow-md mt-8 mb-8">
        <h2 className="text-3xl mb-10 font-semibold  text-center bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
          REGISTRATION FORM
        </h2>

        {/* <hr className='my-6'></hr> */}
        <h2 className="text-2xl font-bold mb-6">Personal Information</h2>

        <label className="block mb-4">
          First Name:
          <input
            type="text"
            id="firstName"
            name="firstName"
            onChange={handleChange}
            className="border border-gray-400 px-3 py-2 rounded w-full"
          
          />
        </label>

        {/* Other form fields */}
        {/* Example: */}
        <label className="block mb-4">
          Last Name:
          <input
            type="text"
            id="lastName"
            name="lastName"
            onChange={handleChange}
            className="border border-gray-400 px-3 py-2 rounded w-full"
          />
        </label>
        <label className="block mb-4">
          Date of Birth:
          <input
            type="date"
            id="dob"
            name="dob"
            onChange={handleChange}
            className="border border-gray-400 px-3 py-2 rounded w-full"
          />
        </label>
        <label className="block mb-4">
          House Number:
          <input
            type="text"
            id="hno"
            name="hno"
            onChange={handleChange}
            className="border border-gray-400 px-3 py-2 rounded w-full"
          />
        </label>
        <label className="block mb-4">
          Street-Name:
          <input
            type="text"
            id="streetname"
            name="streetname"
            onChange={handleChange}
            className="border border-gray-400 px-3 py-2 rounded w-full"
          />
        </label>
        <label className="block mb-4">
          City:
          <input
            type="text"
            id="city"
            name="city"
            onChange={handleChange}
            className="border border-gray-400 px-3 py-2 rounded w-full"
          />
        </label>
        <label className="block mb-4">
          Landmark:
          <textarea
            type="text"
            id="landmark"
            name="landmark"
            onChange={handleChange}
            className="border border-gray-400 px-3 py-2 rounded w-full"
          />
        </label>
        <label className="block mb-4">
          State:
          <select
            id="state"
            name="state"
            value={formData.state || "Telangana"} // Set the value dynamically based on formData.state
            className="border border-gray-400 px-3 py-2 rounded w-full"
            onChange={handleChange}
          >
            <option value="">Select State</option>
            {statesInIndia.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>
        <label className="block mb-4">
          Country:
          <select
            id="country"
            name="country"
            value={formData.country || "India"} // Set the value dynamically based on formData.country
            className="border border-gray-400 px-3 py-2 rounded w-full"
            onChange={handleChange}
          >
            <option value="India">India</option>
          </select>
        </label>

        {/* Add more fields using similar structures */}

        <div className="flex justify-between">
          {!localStorage.getItem("role") && (
            <div className="text-blue-500 mt-3">
              <Link to="/">Already have an account?</Link>
            </div>
          )}
          {/* <button
            onClick={prevStep}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            Previous
          </button> */}
          <div className="flex justify-end">
            <button
              onClick={saveDataAndProceed}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 mt-10 rounded"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
