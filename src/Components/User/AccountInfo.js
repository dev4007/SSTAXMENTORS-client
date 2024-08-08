import React, { useState } from 'react';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'; // Import icons from react-icons

const AccountInfo = ({ formData, setFormData, prevStep, submitForm }) => {
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const saveDataAndSubmit = async () => {
    setLoading(true);
    localStorage.setItem('formData', JSON.stringify(formData));
    try {
      await submitForm(); // Assuming submitForm is an async function
    } catch (error) {
      console.error('Failed to submit the form', error);
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="max-w-2xl w-full bg-white p-8 rounded-md shadow-md mt-8 mb-8">
        <h2 className="text-3xl font-semibold mb-10 text-center bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">REGISTRATION FORM</h2>
        <h2 className="text-2xl font-bold mb-6">Account Information</h2>

        <label className="block mb-4">
          Email:
          <input
            type="email"
            id="email"
            name="email"
            onChange={handleChange}
            className="border border-gray-400 px-3 py-2 rounded w-full"
          />
        </label>

        <label className="block mb-4">
          Phone Number (Whatsapp number recommended):
          <input
            type="tel"
            id="phone"
            name="phone"
            onChange={handleChange}
            className="border border-gray-400 px-3 py-2 rounded w-full"
          />
        </label>
        <label className="block mb-4">
          Password:
          <div className="relative">
            <input
              type={passwordVisible ? 'text' : 'password'}
              id="password"
              name="password"
              className="border border-gray-400 px-3 py-2 rounded w-full focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
              placeholder="Password"
              onChange={handleChange}
            />
            <span
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
            >
              {passwordVisible ? <AiFillEyeInvisible /> : <AiFillEye />}
            </span>
          </div>
        </label>
        <label className="block mb-4">
          Confirm Password:
          <div className="relative">
            <input
              type={confirmPasswordVisible ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              className={`border border-gray-400 px-3 py-2 rounded w-full focus:outline-none focus:ring focus:ring-blue-200 ${
                formData.confirmPassword !== formData.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirm Password"
              onChange={handleChange}
            />
            <span
              onClick={toggleConfirmPasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
            >
              {confirmPasswordVisible ? <AiFillEyeInvisible /> : <AiFillEye />}
            </span>
          </div>
        </label>

        {formData.confirmPassword !== formData.password && (
          <p className="text-red-500">Passwords do not match</p>
        )}

        <div className="flex justify-between mt-10">
          <button
            onClick={prevStep}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            Previous
          </button>
          <button
            onClick={saveDataAndSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            {loading ? 'Loading...' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountInfo;
